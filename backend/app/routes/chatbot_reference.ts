'use client';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import Image from 'next/image';
import 'regenerator-runtime/runtime';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import Speech from 'react-text-to-speech';

import useAuth from '@/recoil/hooks/useAuth';
import useChatHistory from '@/recoil/hooks/useChatHistory';
import character from '@/public/character.gif';
import background from '@/public/background.jpg';
import chatAreaImg from '@/public/chat-area.png';
import bot from '@/public/bot.png';

import removeMd from 'remove-markdown';

const initialSuggestQuestions = [
  { key: 1, question: '千葉県の行政情報について教えていただけますか？', class: 'left-[200px] top-[250px]' },
  { key: 2, question: '千葉県の和菓子情報について教えていただけますか？', class: 'right-[200px] top-[250px]' },
  { key: 3, question: '千葉県の洋菓子情報について教えていただけますか？', class: 'left-[300px] bottom-[40px]' },
  { key: 4, question: '千葉県の観光スポットについて教えてください。', class: 'right-[300px] bottom-[40px]' },
];

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

export default function Chat() {
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const { auth } = useAuth();
  const { chatHistories, setChatHistories } = useChatHistory();

  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const [SuggestQuestions, setSuggestQuestions] = useState(initialSuggestQuestions);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
  }, [chatHistories]);

  const handleSendMessage = async (messageContent: string, role: 'user' | 'ai') => {
    const newMessage: ChatMessage = { role, content: messageContent };
    setChatHistories((prev) => [...prev, newMessage]);
  };

  const fetchChatResponse = async (question: string) => {
    setSuggestQuestions([]);
    setIsLoading(true);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_API_PRO}/chat/respond_to_question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: auth.user?.email || '',
          chat_history: chatHistories,
          question,
          question_type: 'text',
        }),
      });

      if (!response.ok) throw new Error(`HTTP error status: ${response.status}`);

      const reader = response.body?.getReader();
      const decoder = new TextDecoder('utf-8');

      if (!reader) throw new Error('Response body is null');

      let result = '';
      while (true) {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }

        const chunk = decoder.decode(value);
        result += chunk;
        const message: ChatMessage = { role: 'ai', content: result };

        setChatHistories((prevChatHistory) => {
          const result = [...prevChatHistory];
          if (result[result.length - 1]?.role === 'ai') result[result.length - 1] = message;
          else result.push(message);
          return result;
        });

        setUserInput('');

        setIsLoading(false);
      }
    } catch (error) {
      console.error('Error fetching chat response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchSuggestQuestion = async (question: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SERVER_API_PRO}/chat/get_suggest_question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: auth.user?.email || '',
          chat_history: chatHistories,
          question,
          question_type: 'text',
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();

      if (result.follow_up_questions) {
        try {
          const parsedQuestions = JSON.parse(result.follow_up_questions);
          if (Array.isArray(parsedQuestions)) {
            const updatedSuggestQuestions = parsedQuestions.map((question: string, index: number) => {
              let positionClass = '';

              if (index % 4 === 0) {
                positionClass = 'left-[200px] top-[250px]';
              } else if (index % 4 === 1) {
                positionClass = 'right-[200px] top-[250px]';
              } else if (index % 4 === 2) {
                positionClass = 'left-[300px] bottom-[40px]';
              } else {
                positionClass = 'right-[300px] bottom-[40px]';
              }

              return {
                key: index + 1,
                question,
                class: positionClass,
              };
            });

            setSuggestQuestions(updatedSuggestQuestions);
          } else {
            console.error('Parsed follow_up_questions is not an array:', parsedQuestions);
          }
        } catch (error) {
          setSuggestQuestions(initialSuggestQuestions);
        }
      } else {
        console.error('follow_up_questions field is missing in the response:', result);
      }
    } catch (error) {
      console.error('Error fetching suggest questions:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSendMessage(userInput, 'user');
    await fetchChatResponse(userInput);
    await fetchSuggestQuestion(userInput);
    setUserInput('');
  };

  const handleClickFollowQuestion = async (selectedQuestion: string) => {
    await handleSendMessage(selectedQuestion, 'user');
    await fetchChatResponse(selectedQuestion);
    await fetchSuggestQuestion(selectedQuestion);
  };

  return (
    <>
      <div
        className="chat-body p-4 flex-1 overflow-y-scroll border-x max-h-[calc(100vh_-80px)] min-h-[calc(100vh_-80px)] h-full scroll-smooth relative"
        style={{
          backgroundImage: `url(${background.src})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {SuggestQuestions.map((item) => (
          <button
            key={item.key}
            onClick={() => handleClickFollowQuestion(item.question)}
            className={`h-18 w-36 lg:w-60 lg:h-20 bg-gradient-to-br from-black to-indigo-500 text-white rounded-lg cursor-pointer text-sm flex items-center justify-center hover:from-purple-500 hover:to-blue-400 transition-colors ease-in-out duration-300  transform hover:scale-105 absolute ${item.class}`}
          >
            <span className="p-2 text-center">{item.question}</span>
          </button>
        ))}
        <form
          className="flex flex-row items-center p-4 w-[580px] absolute bottom-[60px] z-[10] left-1/2 -translate-x-2/4"
          onSubmit={handleSubmit}
        >
          <div className="relative flex-grow">
            <label>
              <input
                className="rounded-full py-2 px-3 w-full border border-gray-200 bg-gray-200 focus:bg-white focus:outline-none text-gray-600 focus:shadow-md transition duration-300 ease-in"
                type="text"
                placeholder="質問を入力してください。"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                required
                disabled={isLoading}
              />
            </label>
          </div>
          <button
            type="submit"
            className="flex flex-shrink-0 focus:outline-none mx-2 text-blue-600 hover:text-blue-700 w-6 h-6"
            disabled={isLoading}
          >
            {isLoading || listening ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path
                  fill="#808080"
                  d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480V396.4c0-4 1.5-7.8 4.2-10.7L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z"
                ></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512">
                <path
                  fill="#529ae4"
                  d="M498.1 5.6c10.1 7 15.4 19.1 13.5 31.2l-64 416c-1.5 9.7-7.4 18.2-16 23s-18.9 5.4-28 1.6L284 427.7l-68.5 74.1c-8.9 9.7-22.9 12.9-35.2 8.1S160 493.2 160 480V396.4c0-4 1.5-7.8 4.2-10.7L331.8 202.8c5.8-6.3 5.6-16-.4-22s-15.7-6.4-22-.7L106 360.8 17.7 316.6C7.1 311.3 .3 300.7 0 288.9s5.9-22.8 16.1-28.7l448-256c10.7-6.1 23.9-5.5 34 1.4z"
                ></path>
              </svg>
            )}
          </button>
        </form>
        <div className="max-w-[800px] absolute bottom-[40px] left-1/2 -translate-x-2/4">
          <div
            className="w-[600px] mx-auto h-[433px] p-[23px] rounded-[30px] pb-[100px]"
            style={{
              backgroundImage: `url(${chatAreaImg.src})`,
              backgroundRepeat: 'no-repeat',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          >
            <div
              className="w-full max-h-full overflow-y-auto rounded-[20px] p-[10px] scroll-smooth"
              id="style-4"
              ref={chatHistoryRef}
            >
              <div className="flex flex-row justify-start mb-[15px]">
                <div className="messages text-sm text-gray-700 grid grid-flow-row gap-2 max-w-[500px] pt-[10px]">
                  <div className="flex items-center group">
                    <p className="px-6 py-3 rounded-b-[15px] rounded-r-[15px] bg-gray-100 max-w-xs lg:max-w-md">
                      こんにちは！千葉県案内チャットボットです。
                      <br />
                      表示されている選択肢のうち質問内容に近いものを次々に選択していくか、下の入力ボックスに日本語の文章で質問を入力してください。
                      <br />
                      入力ボックスへ入力中に、選択肢として質問が表示された場合は、知りたい質問を選択してください。
                    </p>
                  </div>
                </div>
              </div>
              {chatHistories.map((chat, index) => (
                <div key={index}>
                  {chat.role === 'ai' ? (
                    <div className="flex flex-row justify-start mb-[15px]">
                      <div className="messages text-sm text-gray-700 grid grid-flow-row gap-2 max-w-[500px] pt-[10px]">
                        <div className="flex items-center group">
                          <p className="px-6 py-3 rounded-b-[15px] rounded-r-[15px] bg-gray-100 max-w-xs lg:max-w-md">
                            <ReactMarkdown>{chat.content}</ReactMarkdown>
                          </p>
                        </div>
                        <Speech text={removeMd(chat.content)} lang="ja-JP" />
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-row justify-end mb-[15px]">
                      <div className="messages text-sm text-white grid grid-flow-row gap-2">
                        <div className="flex items-center flex-row-reverse group">
                          <p className="px-6 py-3 rounded-t-[15px] rounded-l-[15px] bg-blue-500 max-w-xs lg:max-w-md">
                            <ReactMarkdown>{chat.content}</ReactMarkdown>
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {isLoading ? (
                <div className="flex flex-row justify-start">
                  <div className="w-[50px] h-[50px] relative flex flex-shrink-0 mr-4">
                    <Image
                      className="w-[50px] h-[50px] object-cover"
                      width={50}
                      height={50}
                      src={character.src}
                      alt=""
                    />
                  </div>
                  <div className="messages text-sm text-gray-700 grid grid-flow-row gap-2">
                    <div className="flex items-center group">
                      <p className="px-6 py-3 rounded-b-[15px] rounded-r-[15px] bg-gray-100 max-w-xs lg:max-w-md">
                        <div aria-label="Loading..." role="status" className="flex items-center space-x-2">
                          <svg className="h-[24px] w-[24px] animate-spin stroke-gray-500" viewBox="0 0 256 256">
                            <line
                              x1="128"
                              y1="32"
                              x2="128"
                              y2="64"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              strokeWidth="24"
                            ></line>
                            <line
                              x1="195.9"
                              y1="60.1"
                              x2="173.3"
                              y2="82.7"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              strokeWidth="24"
                            ></line>
                            <line
                              x1="224"
                              y1="128"
                              x2="192"
                              y2="128"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              strokeWidth="24"
                            ></line>
                            <line
                              x1="195.9"
                              y1="195.9"
                              x2="173.3"
                              y2="173.3"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              strokeWidth="24"
                            ></line>
                            <line
                              x1="128"
                              y1="224"
                              x2="128"
                              y2="192"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              strokeWidth="24"
                            ></line>
                            <line
                              x1="60.1"
                              y1="195.9"
                              x2="82.7"
                              y2="173.3"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              strokeWidth="24"
                            ></line>
                            <line
                              x1="32"
                              y1="128"
                              x2="64"
                              y2="128"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              strokeWidth="24"
                            ></line>
                            <line
                              x1="60.1"
                              y1="60.1"
                              x2="82.7"
                              y2="82.7"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              strokeWidth="24"
                            ></line>
                          </svg>
                          <span className="text-md font-medium text-gray-500">応答生成中</span>
                        </div>
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <></>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
