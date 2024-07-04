import os
import time
from datetime import datetime
from dotenv import load_dotenv
from langchain_chroma import Chroma
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_openai import OpenAIEmbeddings, ChatOpenAI
from langchain_text_splitters import CharacterTextSplitter
from langchain_community.document_loaders import AsyncHtmlLoader
from langchain_community.document_transformers import Html2TextTransformer
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain_community.document_transformers import (
    LongContextReorder,
)

today = datetime.now()
formatted_date = today.strftime("%Y%m%d")

# Define URLs to load
urls = [
    "https://www.pref.chiba.lg.jp/index.html",
    "https://www.pref.chiba.lg.jp/cate/kfk/index.html",
    "https://www.pref.chiba.lg.jp/cate/kbs/index.html",
    "https://www.pref.chiba.lg.jp/cate/ssk/index.html",
    "https://www.pref.chiba.lg.jp/cate/km/index.html",
    "https://www.pref.chiba.lg.jp/cate/kt/index.html",
    "https://www.pref.chiba.lg.jp/cate/baa/index.html",
    "https://nlab.itmedia.co.jp/research/articles/955901/",
    "https://nlab.itmedia.co.jp/research/articles/1165527/",
    "https://maruchiba.jp/",
    "https://tenki.jp/forecast/3/15/",
]

load_dotenv(override=True)

OPENAI__API__KEY = os.environ.get("OEPNAI_API_KEY")

reordering = LongContextReorder()

# Initialize the loader with verification disabled
loader = AsyncHtmlLoader(urls, verify_ssl=False)

# Load HTML content from URLs
txt = loader.load()

# Transform loaded HTML content into plain text
html2text = Html2TextTransformer()
docs_transformed = html2text.transform_documents(txt)

# Split transformed text into chunks
text_splitter = CharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
chunked_text = text_splitter.split_documents(docs_transformed)

converted_chunked_text = [''.join(str(item) for item in tup) for tup in chunked_text]

# Generate embeddings for chunks using Chroma and OpenAI embeddings
vectordb = Chroma.from_texts(
    converted_chunked_text,
    embedding=OpenAIEmbeddings(openai_api_key=OPENAI__API__KEY),
    collection_name="openai_collection",
    persist_directory="chroma_db"
)

# Define a prompt template for contextualizing questions
contextualize_q_system_prompt = f"""
今日の日付は{today.year}年{today.month}月{today.day}日です。
千葉県に関する行政情報や旅行情報に詳しいアシスタントです。
ステップバイステップで考えてみましょう。ユーザーの質問を独立した形で再構築し、明確に理解できるようにしてください。
簡潔で情報量のあるスタイルを保ち、読みやすいようにMarkdown形式で回答をフォーマットしてください。
"""

# Initialize the LLM model
llm = ChatOpenAI(model_name="gpt-3.5-turbo", openai_api_key=OPENAI__API__KEY, temperature=0.3)

# Create a prompt template for contextualizing questions
contextualize_q_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", contextualize_q_system_prompt),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{question}"),
    ]
)

# Chain operations for contextualizing questions
contextualize_q_chain = contextualize_q_prompt | llm | StrOutputParser()

# Function to handle contextualization of questions
def contextualized_question(input: dict):
    if input.get("chat_history"):
        return contextualize_q_chain
    else:
        return input["question"]

# Initialize the vector store
vectorstore = Chroma(persist_directory="./chroma_db", embedding_function=OpenAIEmbeddings(openai_api_key=OPENAI__API__KEY), collection_name="openai_collection")

# Set up the retriever
retriever = vectorstore.as_retriever(search_kwargs={"k": 6})

#add reranker
reordering.transform_documents(retriever)



# Define a prompt template for answering questions
qa_system_prompt = f"""今日の日付が{today.year}年{today.month}月{today.day}日であることを覚えておいてください。"""
qa_system_prompt = qa_system_prompt + """
最後の質問に答えるために、以下のすべての文脈を文書で使用する。
チャット履歴からユーザーの質問に答えることができる場合は、提供された文書を参照する必要はありません。
提供された文書に答えがない場合は、あなたの既存の知識を活用しても大丈夫です。
しかし、この場合には必ず回答の出所を明らかにしなければなりません。
回答はMarkdownでフォーマットしてください。
{context} 
"""

# Create a prompt template for answering questions
qa_prompt = ChatPromptTemplate.from_messages(
    [
        ("system", qa_system_prompt),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "{question},Reply with japanese language"),
    ]
)

# Define a prompt for generating follow-up questions
rag_chain = (
    RunnablePassthrough.assign(
        context=contextualized_question | retriever
    )
    | qa_prompt
    | llm
    | StrOutputParser()
)



follow_up_q_prompt = """
ユーザーの質問に基づいて、千葉県に関連する適切なフォローアップ質問を2-4つ提案します。
これらの質問を回答を提供せずに、ユーザーの興味に合わせてリスト形式で提示してください。重複や些細な質問を避けてください。
以下のフォーマットに従ってください:
--- フォーマットテンプレート ---
[
"質問1",
"質問2",
"質問3",
"質問4"
]
"""

follow_up_prompt_template = ChatPromptTemplate.from_messages(
    [
        ("system", follow_up_q_prompt),
        MessagesPlaceholder(variable_name="chat_history"),
        ("human", "与えられた質問 {question} に基づいて、元の質問の文脈に沿った千葉県に関する2～4個のフォローアップ質問を生成してください。質問はリスト形式で回答を含めずに提示してください。フォローアップ質問は元の質問で言及されたトピックに関連するものであり、重複や些細な質問は避けてください。日本語で返信してください。"),
    ]
)

follow_up_chain = follow_up_prompt_template | llm | StrOutputParser()

def generate_response(question, chat_history=[]):
    for chunk in rag_chain.stream({'question': question, 'chat_history': chat_history}):
        yield chunk

def generate_follow_up_question(question, chat_history=[]):
    follow_up_questions = follow_up_chain.invoke({'question': question, 'chat_history': chat_history})
    return follow_up_questions