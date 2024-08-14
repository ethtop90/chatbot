// frontend/src/components/PageComponents/LearningLog.tsx

import React, { useState, useEffect } from "react";
import { APIService } from "../../util/APIService";
import "../../assets/css/style.css";
import toast from "react-hot-toast";
import Modal from "../modal/EditModal"; // Assume you create this modal component

interface ChatLog {
    _id: string;
    date: string;
    user_email: string;
    question: string;
    answer: string;
}

interface ChatLogResponse {
    chat_logs: ChatLog[];
}

const ChatLog: React.FC = () => {
    const [data, setData] = useState<ChatLog[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    // const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
    // const [currentLog, setCurrentLog] = useState<ChatLog | null>(null);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem("access_token");
            const config = {
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: "application/json"
                },
            };
            const response = await APIService.get<ChatLogResponse>(
                "/chatLog/",
                config
            );
            const res: ChatLogResponse = response.data; // Explicitly type the response
            setData(res.chat_logs);
            toast.success("操作は正常に続行されました");
            setLoading(false);
        } catch (err) {
            toast.error("操作に失敗しました。");
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    useEffect(() => {
    }, [data]);

    const truncateString = (str: string, num: number) => {
        if (str.length <= num) {
            return str;
        }
        return str.slice(0, num) + "...";
    };

    // const sortedData = data.sort(
    //     (a, b) =>
    //         new Date(b.date).getTime() - new Date(a.date).getTime()
    // );

    const handleDelete = async (id: string) => {
        if (window.confirm("この項目を削除してもよろしいですか？")) {
            try {
                const token = localStorage.getItem("access_token");
                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };
                await APIService.delete(`/chatLog/delete/${id}`, config);
                setData((prevData) => prevData.filter((item) => item._id !== id));
                fetchData();
                toast.success("操作は正常に続行されました");
            } catch (err) {
                toast.error("削除に失敗しました");
            }
        }
    };

    return (
        <div className="flex flex-col h-full max-h-full p-4">
            <h1 className="sticky top-0 z-20 mb-4 text-xl font-bold bg-white">
                会話ログ
            </h1>
            <div className="flex-grow overflow-y-auto table-container">
                <table className="min-w-full border-collapse">
                    <thead className="sticky top-0 z-10 bg-white">
                        <tr className="bg-white border-0">
                            <th className="p-2 border-gray-300"></th>
                            <th className="p-2 text-left border-gray-300 w-30">番号</th>
                            <th className="p-2 text-left border-gray-300 w-30">会話日時</th>
                            <th className="p-2 text-left border-gray-300 w-30">
                                ユーザー email
                            </th>
                            <th className="p-2 text-left border-gray-300">ユーザー入力文</th>
                            <th className="p-2 text-left border-gray-300">ロボット回答文</th>
                            <th className="p-2 border-gray-300"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.length != 0 && data.map((log, index) => (
                            <tr key={index} className="bg-gray-100 border-gray-600">
                                <td className="p-2 pl-0 text-center align-middle bg-white">
                                    <input type="checkbox" className="w-3 h-3" />
                                </td>
                                <td className="p-2 pl-0 text-center align-middle bg-white">
                                    {index + 1}
                                </td>
                                <td
                                    className="p-2 border-t  align-middle border-b border-l text-ellipsis"
                                >
                                    {truncateString(log.date, 15)}
                                </td>
                                <td
                                    className="w-32 p-2 underline  align-middle border-t border-b text-ellipsis"
                                >
                                    {truncateString(log.user_email, 15)}
                                </td>
                                <td
                                    className="max-w-[300px] p-2  align-middle border-t border-b"
                                    title={log.question}
                                >
                                    <p
                                        className="w-full "
                                        style={{ whiteSpace: "normal", wordWrap: "break-word" }}
                                    >
                                        {log.question}
                                    </p>
                                </td>
                                <td
                                    className="p-2  align-middle border-t border-b"
                                    title={log.answer}
                                >
                                    {truncateString(log.answer, 20)}
                                </td>
                                <td className="p-2  align-middle border-t border-b ">
                                    <div className="flex justify-start  align-middle">
                                        <button
                                            className="w-10 h-10 text-xs text-white bg-red-600 rounded-full text-[10px]"
                                            onClick={() => handleDelete(log._id)}
                                        >
                                            削除
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default ChatLog;
