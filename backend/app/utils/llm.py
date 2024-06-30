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

load_dotenv()

OPENAI__API__KEY = os.environ.get("OPEN_API_KEY")

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
contextualize_q_system_prompt = f"""今日の日付が{today.year}年{today.month}月{today.day}日であることを覚えておいてください。チャット履歴と最新のユーザー質問を考慮し、チャット履歴のコンテキストを参照する可能性のある質問を独立した質問に整形してください。チャット履歴なしでも理解できる形で質問を再構築してください。Markdown形式でレスポンスを整形してください。"""

# Initialize the LLM model
llm = ChatOpenAI(model_name="gpt-3.5-turbo-0125", openai_api_key=OPENAI__API__KEY, temperature=0)

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
retriever = vectorstore.as_retriever(search_kwargs={"k": 12})

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
    ("human", "{question}"),
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
既存の文書とチャット記録、ユーザーの最後の質問に基づいて、ユーザーができる次の2～4個の質問を返してください。書式テンプレートを使用してください。答えを繰り返さないでください。
---書式テンプレート
[
"質問1",
"質問2",
"質問3",
"質問4"
]
---書式テンプレート終了---
"""

follow_up_prompt_template = ChatPromptTemplate.from_messages(
  [
    ("system", follow_up_q_prompt),
    MessagesPlaceholder(variable_name="chat_history"),
    ("human", "{question}"),
  ]
)

follow_up_chain = follow_up_prompt_template | llm | StrOutputParser()


# def generate_response(question, chat_history=[]):
#     ai_msg = rag_chain.astream({'question': question, 'chat_history': chat_history})
#     follow_up_questions = follow_up_chain.astream({'question': question, 'chat_history': chat_history})

#     response = {
#         "answer": ai_msg,
#         "follow_up_questions": follow_up_questions.split('\n')
#     }
#     print('------->>>', response)
    
#     return response

def generate_response(question, chat_history=[]):
  for chunk in rag_chain.stream({'question': question, 'chat_history': chat_history}):
    yield chunk

def generate_followUp_question(question, chat_history=[]):
  follow_up_questions = follow_up_chain.invoke({'question': question, 'chat_history': chat_history})
  return follow_up_questions