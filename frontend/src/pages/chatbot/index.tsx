import React, { useEffect, useState, useRef, Key } from 'react';
import { useSearchParams } from 'react-router-dom';
import './style.css'; // Import the custom styles
import { APIService } from '../../util/APIService';
import { baseUrl } from "../../util/endpoints";


interface Keyword {
  id: string;
  text: string;
}

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
}

const Chatbot: React.FC = () => {
  const [searchParams] = useSearchParams();
  const chatbotID = searchParams.get('id');
  const companyName = searchParams.get('companyname');
  const chatHistoryRef = useRef<HTMLDivElement>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [chatHistories, setChatHistories] = useState<ChatMessage[]>([]);

  const [userInput, setUserInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [greetings, setGreetings] = useState('');
  const [suggestQuestions, setSuggestQuestions] = useState<string[]>([]);

  useEffect(() => {
    if (chatHistoryRef.current) {
      chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
    }
    console.log(chatHistories);
  }, [chatHistories, suggestQuestions]);

  const handleSendMessage = async (messageContent: string, role: 'user' | 'ai') => {
    const newMessage: ChatMessage = { role, content: messageContent };
    setChatHistories((prev) => [...prev, newMessage]);
  };

  const fetchChatResponse = async (question: string) => {
    setSuggestQuestions([]);
    setIsLoading(true);

    try {
      const token = localStorage.getItem('access_token');

      const response = await fetch(`${baseUrl}/chatbot/respond_to_question`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          chatbotID: chatbotID,
          chat_history: chatHistories,
          question,
          question_type: 'text',
        }),
      });

      if (response.status !== 200) throw new Error(`HTTP error status: ${response.status}`);
      console.log(response);
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
        console.log(chunk);
        result += chunk;
        const chat: ChatMessage = { role: 'ai', content: result };
        console.log(chat);
        setChatHistories((prevChatHistory) => {
          const updatedChatHistories = [...prevChatHistory];
          if (updatedChatHistories[updatedChatHistories.length - 1]?.role === 'ai') {
            updatedChatHistories[updatedChatHistories.length - 1] = chat;
          } else {
            updatedChatHistories.push(chat);
          }
          return updatedChatHistories;
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

      const response = await APIService.post(
        '/chatbot/get_suggest_question',
        JSON.stringify({
          chatbotID: chatbotID,
          chat_history: chatHistories,
          question,
          question_type: 'text',
        }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = response.data;

      if (result.follow_up_questions) {
        const suggestQuestionsArray: string[] = JSON.parse(result.follow_up_questions);
        setSuggestQuestions(suggestQuestionsArray);
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

  const handleKeywordClick = async (keywordText: string) => {
    await handleSendMessage(keywordText, 'user');
    await fetchChatResponse(keywordText);
    await fetchSuggestQuestion(keywordText);
    setUserInput('');
  };

  const handleClickFollowQuestion = async (selectedQuestion: string) => {
    await handleSendMessage(selectedQuestion, 'user');
    await fetchChatResponse(selectedQuestion);
    await fetchSuggestQuestion(selectedQuestion);
  };

  const fetchInitialData = async () => {
    try {
      const response = await APIService.post(
        '/chatbot/',
        JSON.stringify({
          chatbotID: chatbotID,
        }),
        {
          headers: {
            'Content-Type': 'application/json',
          },
        },
      );

      if (response.status !== 200) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = response.data;

      if (result.keywords) {
        const keywordsArray: string[] = JSON.parse(result.keywords);
        setKeywords(keywordsArray);
      }
      if (result.greetings) {
        setGreetings(result.greetings);
      }

      if (result.logs) {
        const logsArray: ChatMessage[] = JSON.parse(result.logs);

        setChatHistories(logsArray);
      }
    } catch (error) {
      console.error('Error fetching initial data:', error);
    }
  };

  useEffect(() => {
    fetchInitialData();
    console.log(chatbotID);
  }, []);

  return (
    <div className="font-noto-sans">
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-opacity-60">
        <div className="bg-white w-full h-full flex flex-col rounded-lg overflow-hidden shadow-lg">
          {/* Header */}
          <div className="bg-[#2D2D2D] h-[71px] flex items-center p-6" id="chatbotWindowFrame" >
            <div className="flex items-center">
              <div className="p-3">
                <svg width="38" height="27" viewBox="0 0 38 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18.8018 0L0.799988 7.95605L12.2109 13.4103L18.8018 10.4972V0Z" fill="#E6E6E6" />
                  <path d="M0.799988 18.4227L18.7439 27V16.5387L0.799988 7.96143V18.4227Z" fill="white" />
                  <path d="M19.9655 0V10.5006L26.5564 13.4136L37.9673 7.95944L19.9655 0Z" fill="#E6E6E6" />
                  <path d="M37.9666 7.96143V18.4227L20.0234 27V16.5387L37.9666 7.96143Z" fill="white" />
                </svg>
              </div>
              <span className="ml-2 text-white font-TimeBurner">{companyName}</span>
            </div>
          </div>
          {/* Keyword buttons */}
          <div className="flex items-center">
            <div className="box-border flex flex-row items-center justify-start py-5 space-x-2 h-[80px] overflow-x-auto overflow-y-hidden no-scrollbar">
              {keywords?.map((value: string, index: number) => (
                <button
                  key={index}
                  className="px-4 py-2 border border-black h-[40px] text-[#8E8E8E] text-[15px] rounded-[6px] whitespace-nowrap"
                onClick={() => handleKeywordClick(value)}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>

          {/* Main Chat Area */}
          <div className="flex-1 px-10 py-4 space-y-6 overflow-y-auto main-chat-area" ref={chatHistoryRef}>
            <div className='flex items-start space-x-4'>

              <div className="p-3">
                <svg width="36" height="27" viewBox="0 0 36 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M17.4354 0L0 7.95634L11.0519 13.4107L17.4354 10.4976V0Z" fill="#4D4D4D" />
                  <path d="M0 18.4226L17.3794 27.0002V16.5385L0 7.96094V18.4226Z" fill="#666666" />
                  <path d="M18.5621 0V10.501L24.9456 13.4141L35.9976 7.95972L18.5621 0Z" fill="#4D4D4D" />
                  <path d="M35.9998 7.96094V18.4226L18.6211 27.0002V16.5385L35.9998 7.96094Z" fill="#666666" />
                </svg>
              </div>
              <div>
                <div className="text-[14px] font-bold ">{companyName}</div>
                {greetings && (

                  <div
                    className="mt-2 bg-[#F2F2F2] rounded-lg p-4"
                  >
                    {greetings}
                  </div>
                )}
                {/*
                {suggestQuestions && (
                  <div className="flex flex-row flex-wrap justify-start">
                    {suggestQuestions?.map((question: string, qIndex: Key) => (
                      <button
                        key={qIndex}
                        className="border border-black rounded-lg px-4 py-2 text-[15px] mr-2 mt-2"
                        onClick={() => handleClickFollowQuestion(question)}
                      >
                        {question}
                      </button>
                    ))}
                  </div>
                )}*/}
              </div>
            </div>
            {chatHistories.map((chat, index) => (
              <div key={index} className={`flex ${chat.role === 'user' ? 'justify-end' : 'items-start space-x-4'}`}>
                {chat.role === 'ai' && (
                  <div className="p-3">
                    <svg width="36" height="27" viewBox="0 0 36 27" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M17.4354 0L0 7.95634L11.0519 13.4107L17.4354 10.4976V0Z" fill="#4D4D4D" />
                      <path d="M0 18.4226L17.3794 27.0002V16.5385L0 7.96094V18.4226Z" fill="#666666" />
                      <path d="M18.5621 0V10.501L24.9456 13.4141L35.9976 7.95972L18.5621 0Z" fill="#4D4D4D" />
                      <path d="M35.9998 7.96094V18.4226L18.6211 27.0002V16.5385L35.9998 7.96094Z" fill="#666666" />
                    </svg>
                  </div>
                )}
                <div>
                  {chat.role === 'ai' && <div className="text-[14px] font-bold ">Chatbot Title</div>}
                  {Array.isArray(chat.content) ? (
                    chat.content.map((text, i) => (
                      <div
                        key={i}
                        className={` text-[15px] ${chat.role === 'ai' ? 'mt-2 bg-[#F2F2F2]' : 'bg-[#3B3B3B] text-white'
                          } rounded-lg p-4`}
                      >
                        {text}
                      </div>
                    ))
                  ) : (
                    <div
                      className={` text-[15px] ${chat.role === 'ai' ? 'mt-2 bg-[#F2F2F2]' : 'bg-[#3B3B3B] text-white'
                        } rounded-lg p-4`}
                    >
                      {chat.content}
                    </div>
                  )}
                  {chat.role === 'ai' && suggestQuestions && index == (chatHistories.length - 1) && (
                    <div className="flex flex-row flex-wrap justify-start">
                      {suggestQuestions.map((question: string, qIndex: Key) => (
                        <button
                          key={qIndex}
                          className="border border-black rounded-lg px-4 py-2 text-[15px] mr-2 mt-2"
                          onClick={() => handleClickFollowQuestion(question)}
                        >
                          {question}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

            ))}
            {isLoading ? (
              <div className="flex flex-row justify-start">
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

          {/* Message Input */}
          <div className="flex items-center p-6 border-t-[2px] sm:p-2 md:px-10 md:py-6">
            <label className="w-full">
              <textarea
                className="w-full p-2 rounded-lg bg-[#F2F2F2] resize-none"
                // type="text"
                
                placeholder="質問を入力してください。"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.metaKey) { // Check for Enter key, but allow Ctrl + Enter for submission
                    // e.preventDefault(); // Prevent the default behavior of adding a new line
                  } else if (e.key === 'Enter' && e.metaKey) {
                    handleSubmit(e);
                  }
                }}
                required
                disabled={isLoading}
                rows={1}
              />
            </label>
            <button type="submit" className="sm:pl-1 md:pl-4" disabled={isLoading} onClick={handleSubmit}>
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M11.8182 15.1755L27.1666 6.49878L21.6911 25.9244L15.4742 23.313L11.4475 27.407L11.0263 21.0722L4.92737 19.0673L10.3693 16.001"
                  stroke="black"
                  strokeWidth="0.8"
                  strokeMiterlimit="10"
                />
                <path
                  d="M11.0262 21.0722L27.1666 6.49878L15.474 23.313"
                  stroke="black"
                  strokeWidth="0.8"
                  strokeMiterlimit="10"
                  strokeLinejoin="bevel"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Chatbot;
