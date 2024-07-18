// frontend/src/components/PageComponents/LearningLog.tsx

import React, { useState, useEffect } from "react";
import { APIService } from "../../util/APIService";
import "../../assets/css/style.css";
import toast from "react-hot-toast";
import Modal from "../modal/EditModal"; // Assume you create this modal component

interface LearningLogData {
  id: string;
  title: string;
  type: "URL形式" | "ファイル形式" | "手入力形式";
  note?: string;
  learningDate: string;
}

const LearningLog: React.FC = () => {
  const [data, setData] = useState<LearningLogData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [currentLog, setCurrentLog] = useState<LearningLogData | null>(null);

  // State variables for different log types
  const [urlLogData, setUrlLogData] = useState({
    URL: "",
    title: "",
    remarks: "",
  });
  const [fileLogData, setFileLogData] = useState<File | null>(null);
  const [textLogData, setTextLogData] = useState({ title: "", content: "" });


  const fetchData = async () => {
      try {
        const token = localStorage.getItem("access_token");
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        const response = await APIService.get<LearningLogData[]>(
          "/learningLogs/",
          config
        );
        setData(response.data);
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

  const truncateString = (str: string, num: number) => {
    if (str.length <= num) {
      return str;
    }
    return str.slice(0, num) + "...";
  };

  const sortedData = data.sort(
    (a, b) =>
      new Date(b.learningDate).getTime() - new Date(a.learningDate).getTime()
  );

  const openEditModal = (log: LearningLogData) => {
    setCurrentLog(log);
    if (log.type === "URL形式") {
      setUrlLogData({
        URL: "",
        title: log.title,
        remarks: log.note || "",
      });
    } else if (log.type === "ファイル形式") {
      setFileLogData(null);
    } else if (log.type === "手入力形式") {
      setTextLogData({ title: log.title, content: log.note || "" });
    }
    setIsModalOpen(true);
  };

  const handleUrlChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setUrlLogData({
      ...urlLogData,
      [name]: value,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFileLogData(e.target.files[0]);
    }
  };

  const handleTextChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setTextLogData({
      ...textLogData,
      [name]: value,
    });
  };

  const handleModalSave = async () => {
    if (!currentLog) return;
    try {
      const token = localStorage.getItem("access_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };

      let response;
      if (currentLog.type === "URL形式") {
        response = await APIService.post(
          `/learningLogs/${currentLog.id}`,
          urlLogData,
          config
        );
      } else if (currentLog.type === "ファイル形式") {
        console.log("ファイル形式");
        const formData = new FormData();
        if (fileLogData) {
          formData.append("files", fileLogData);
          console.log(fileLogData);
        }
        response = await APIService.post(
          `/learningLogs/${currentLog.id}`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
      } else if (currentLog.type === "手入力形式") {
        response = await APIService.post(
          `/learningLogs/${currentLog.id}`,
          textLogData,
          config
        );
      }

      // setData((prevData) =>
      //   prevData.map((item) =>
      //     item.id === currentLog.id
      //       ? { ...item, ...urlLogData, ...textLogData }
      //       : item
      //   )
      // );
      fetchData();
      toast.success("操作は正常に続行されました");
      setIsModalOpen(false);
    } catch (err) {
      toast.error("編集に失敗しました");
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm("この項目を削除してもよろしいですか？")) {
      try {
        const token = localStorage.getItem("access_token");
        const config = {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        };
        await APIService.delete(`/learningLogs/${id}`, config);
        setData((prevData) => prevData.filter((item) => item.id !== id));
        toast.success("操作は正常に続行されました");
      } catch (err) {
        toast.error("削除に失敗しました");
      }
    }
  };

  return (
    <div className="flex flex-col h-full max-h-full p-4">
      <h1 className="sticky top-0 z-20 mb-4 text-xl font-bold bg-white">
        学習ログ
      </h1>
      <div className="flex-grow overflow-y-auto table-container">
        <table className="min-w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-white">
            <tr className="bg-white border-0">
              <th className="p-2 border-gray-300"></th>
              <th className="p-2 text-left border-gray-300 w-30">タイトル</th>
              <th className="p-2 text-left border-gray-300 w-30">
                ファイル形式
              </th>
              <th className="p-2 text-left border-gray-300">備考</th>
              <th className="p-2 text-left border-gray-300">学習日</th>
              <th className="p-2 border-gray-300"></th>
            </tr>
          </thead>
          <tbody>
            {sortedData.map((log, index) => (
              <tr key={index} className="bg-gray-100 border-gray-600">
                <td className="p-2 pl-0 text-center align-middle bg-white">
                  <input type="checkbox" className="w-3 h-3" />
                </td>
                <td
                  className="p-2 align-top border-t border-b border-l max-w-40 text-ellipsis"
                  title={log.title}
                >
                  {truncateString(log.title, 15)}
                </td>
                <td
                  className="w-32 p-2 underline align-top border-t border-b text-ellipsis"
                  title={log.type}
                >
                  {truncateString(log.type, 15)}
                </td>
                <td
                  className="max-w-[300px] p-2 align-top border-t border-b"
                  title={log.note}
                >
                  <p
                    className="w-full "
                    style={{ whiteSpace: "normal", wordWrap: "break-word" }}
                  >
                    {log.type === "URL形式" || log.type === "手入力形式"
                      ? log.note
                      : ""}
                  </p>
                </td>
                <td
                  className="p-2 align-top border-t border-b w-36"
                  title={log.learningDate}
                >
                  {truncateString(log.learningDate, 20)}
                </td>
                <td className="p-2 align-top border-t border-b ">
                  <div className="flex justify-start align-top">
                    <button
                      className="w-6 h-6 mr-1 text-xs text-white bg-gray-600 rounded-full text-[10px]"
                      onClick={() => openEditModal(log)}
                    >
                      編集
                    </button>
                    <button
                      className="w-6 h-6 text-xs text-white bg-red-600 rounded-full text-[10px]"
                      onClick={() => handleDelete(log.id)}
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
      {isModalOpen && currentLog && (
        <Modal
          title="学習ログ編集"
          onClose={() => setIsModalOpen(false)}
          onSave={handleModalSave}
        >
          <div className="p-4">
            {currentLog.type === "URL形式" && (
              <>
                <label className="block mb-2 text-sm font-bold text-gray-700">
                  URL
                </label>
                <input
                  type="text"
                  name="URL"
                  value={urlLogData.URL}
                  onChange={handleUrlChange}
                  className="w-full p-2 mb-4 border rounded"
                />
                <label className="block mb-2 text-sm font-bold text-gray-700">
                  タイトル
                </label>
                <input
                  type="text"
                  name="title"
                  value={urlLogData.title}
                  onChange={handleUrlChange}
                  className="w-full p-2 mb-4 border rounded"
                />
                <label className="block mb-2 text-sm font-bold text-gray-700">
                  備考
                </label>
                <textarea
                  name="remarks"
                  value={urlLogData.remarks}
                  onChange={handleUrlChange}
                  className="w-full p-2 mb-4 border rounded"
                />
              </>
            )}
            {currentLog.type === "ファイル形式" && (
              <>
                <label className="block mb-2 text-sm font-bold text-gray-700">
                  ファイルを選択
                </label>
                <input
                  type="file"
                  name="file"
                  onChange={handleFileChange}
                  className="w-full p-2 mb-4 border rounded"
                />
              </>
            )}
            {currentLog.type === "手入力形式" && (
              <>
                <label className="block mb-2 text-sm font-bold text-gray-700">
                  タイトル
                </label>
                <input
                  type="text"
                  name="title"
                  value={textLogData.title}
                  onChange={handleTextChange}
                  className="w-full p-2 mb-4 border rounded"
                />
                <label className="block mb-2 text-sm font-bold text-gray-700">
                  内容
                </label>
                <textarea
                  name="content"
                  value={textLogData.content}
                  onChange={handleTextChange}
                  className="w-full p-2 mb-4 border rounded"
                />
              </>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

export default LearningLog;
