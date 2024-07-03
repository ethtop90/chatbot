import React, { useState } from "react";
import "./style.css"; // Import the custom styles
import { FaPaperPlane } from "react-icons/fa";


interface Message {
  type: "user" | "bot";
  content: string | string[];
  followUpQuestions?: string[];
}

const testData: Message[] = [
  {
    type: "bot",
    content: [
      "Hello! How can I assist you today?",
      "Hello! How can I assist you today?",
    ],
    followUpQuestions: ["What is your name?", "How does this work?"],
  },
  {
    type: "user",
    content: "Can you tell me a joke?",
  },
  {
    type: "bot",
    content: [
      "Sure! Why did the scarecrow win an award? Because he was outstanding in his field!",
    ],
    followUpQuestions: ["Tell me another joke", "What else can you do?"],
  },
  {
    type: "user",
    content:
      "Can you tell me a joke?Can you tell me a joke?Can you tell me a joke?Can you tell me a joke?Can you tell me a joke?",
  },
  {
    type: "bot",
    content: [
      "Sure! Why did the scarecrow win an award? Because he was outstanding in his field!",
    ],
    followUpQuestions: ["Tell me another joke", "What else can you do?"],
  },
  {
    type: "user",
    content: "Can you tell me a joke?",
  },
  {
    type: "bot",
    content: [
      "Sure! Why did the scarecrow win an award? Because he was outstanding in his field!",
    ],
    followUpQuestions: ["Tell me another joke", "What else can you do?"],
  },
  {
    type: "user",
    content: "Can you tell me a joke?",
  },
];

const Chatbot: React.FC = () => {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>(testData);
  const [input, setInput] = useState("");

  const handleSendMessage = (message: string) => {
    if (message.trim()) {
      setMessages((prevMessages) => [
        ...prevMessages,
        { type: "user", content: message },
        {
          type: "bot",
          content: ["This is a response from the chatbot."],
          followUpQuestions: ["Follow-up Question 1", "Follow-up Question 2"],
        },
      ]);
      setInput("");
    }
  };

  const handleFollowUpClick = (question: string) => {
    handleSendMessage(question);
  };

  return (
    <div className="font-noto-sans">
      <button onClick={() => setIsChatbotOpen(true)}>Open Chatbot</button>

      {isChatbotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-60 sm:px-[10px] lg:px-[100px]">
          <div className="bg-white w-full h-full md:h-auto md:max-h-[90vh] flex flex-col rounded-lg overflow-hidden shadow-lg">
            {/* Header */}
            <div className="bg-[#2D2D2D] h-[71px] flex items-center p-6">
              <div className="flex items-center">
                <div className="p-3">
                  <svg
                    width="38"
                    height="27"
                    viewBox="0 0 38 27"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M18.8018 0L0.799988 7.95605L12.2109 13.4103L18.8018 10.4972V0Z"
                      fill="#E6E6E6"
                    />
                    <path
                      d="M0.799988 18.4227L18.7439 27V16.5387L0.799988 7.96143V18.4227Z"
                      fill="white"
                    />
                    <path
                      d="M19.9655 0V10.5006L26.5564 13.4136L37.9673 7.95944L19.9655 0Z"
                      fill="#E6E6E6"
                    />
                    <path
                      d="M37.9666 7.96143V18.4227L20.0234 27V16.5387L37.9666 7.96143Z"
                      fill="white"
                    />
                  </svg>
                </div>
                <span className="ml-2 text-white font-TimeBurner">PERVA</span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="box-border flex flex-row items-center justify-start  py-5 space-x-2  h-[80px] overflow-x-auto overflow-y-hidden no-scrollbar">
                <button className="px-4 py-2 border border-[#D3D3D3] w-[177px] h-[40px] text-[#8E8E8E] text-[15px] rounded-[6px] whitespace-nowrap">
                  Quick Question 1
                </button>
                <button className="px-4 py-2 border border-[#D3D3D3] w-[177px] h-[40px] text-[#8E8E8E] text-[15px] rounded-[6px] whitespace-nowrap">
                  Quick Question 2
                </button>
                <button className="px-4 py-2 border border-[#D3D3D3] w-[177px] h-[40px] text-[#8E8E8E] text-[15px] rounded-[6px] whitespace-nowrap">
                  Quick Question 3
                </button>
                <button className="px-4 py-2 border border-[#D3D3D3] w-[177px] h-[40px] text-[#8E8E8E] text-[15px] rounded-[6px] whitespace-nowrap">
                  Quick Question 4
                </button>
                <button className="px-4 py-2 border border-[#D3D3D3] w-[177px] h-[40px] text-[#8E8E8E] text-[15px] rounded-[6px] whitespace-nowrap">
                  Quick Question 5
                </button>
                <button className="px-4 py-2 border border-[#D3D3D3] w-[177px] h-[40px] text-[#8E8E8E] text-[15px] rounded-[6px] whitespace-nowrap">
                  Quick Question 6
                </button>
                <button className="px-4 py-2 border border-[#D3D3D3] w-[177px] h-[40px] text-[#8E8E8E] text-[15px] rounded-[6px] whitespace-nowrap">
                  Quick Question 7
                </button>
                <button className="px-4 py-2 border border-[#D3D3D3] w-[177px] h-[40px] text-[#8E8E8E] text-[15px] rounded-[6px] whitespace-nowrap">
                  Quick Question 8
                </button>
              </div>
            </div>

            {/* Main Chat Area */}
            <div className="flex-1 px-10 py-4 space-y-6 overflow-y-auto main-chat-area">
              {messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${
                    message.type === "user"
                      ? "justify-end"
                      : "items-start space-x-4"
                  }`}
                >
                  {message.type === "bot" && (
                    <div className="p-3">
                      <svg
                        width="36"
                        height="27"
                        viewBox="0 0 36 27"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M17.4354 0L0 7.95634L11.0519 13.4107L17.4354 10.4976V0Z"
                          fill="#4D4D4D"
                        />
                        <path
                          d="M0 18.4226L17.3794 27.0002V16.5385L0 7.96094V18.4226Z"
                          fill="#666666"
                        />
                        <path
                          d="M18.5621 0V10.501L24.9456 13.4141L35.9976 7.95972L18.5621 0Z"
                          fill="#4D4D4D"
                        />
                        <path
                          d="M35.9998 7.96094V18.4226L18.6211 27.0002V16.5385L35.9998 7.96094Z"
                          fill="#666666"
                        />
                      </svg>
                    </div>
                  )}
                  <div
                  // className={`max-w-md ${
                  //   message.type === "user"
                  //     ? "bg-blue-100 p-0"
                  //     : "bg-white p-4"
                  // }  rounded-lg shadow`}
                  >
                    {message.type === "bot" && (
                      <div className="text-[14px] font-bold ">
                        Chatbot Title
                      </div>
                    )}
                    {Array.isArray(message.content) ? (
                      message.content.map((text, i) => (
                        <div
                          key={i}
                          className={` text-[15px] ${
                            message.type === "bot"
                              ? "mt-2 bg-[#F2F2F2]"
                              : "bg-[#3B3B3B] text-white"
                          } rounded-lg p-4`}
                        >
                          {text}
                        </div>
                      ))
                    ) : (
                      <div
                        className={` text-[15px] ${
                          message.type === "bot"
                            ? "mt-2 bg-[#F2F2F2]"
                            : "bg-[#3B3B3B] text-white"
                        } rounded-lg p-4`}
                      >
                        {message.content}
                      </div>
                    )}
                    {message.followUpQuestions && (
                      <div className="flex flex-row flex-wrap justify-start">
                        {message.followUpQuestions.map((question, qIndex) => (
                          <button
                            key={qIndex}
                            className="border border-black rounded-lg px-4 py-2 text-[15px] mr-2 mt-2"
                            onClick={() => handleFollowUpClick(question)}
                          >
                            {question}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Message Input */}
            <div className="flex items-center p-6 border-t-[2px] sm:p-2 md:px-10 md:py-6">
              <textarea
                className="flex-1 p-2 rounded-lg bg-[#F2F2F2]"
                rows={1}
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage(input)}
              ></textarea>
              <button
                onClick={() => handleSendMessage(input)}
                className="sm:pl-1 md:pl-4 "
              >
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M11.8182 15.1755L27.1666 6.49878L21.6911 25.9244L15.4742 23.313L11.4475 27.407L11.0263 21.0722L4.92737 19.0673L10.3693 16.001"
                    stroke="black"
                    stroke-width="0.8"
                    stroke-miterlimit="10"
                  />
                  <path
                    d="M11.0262 21.0722L27.1666 6.49878L15.474 23.313"
                    stroke="black"
                    stroke-width="0.8"
                    stroke-miterlimit="10"
                    stroke-linejoin="bevel"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chatbot;
