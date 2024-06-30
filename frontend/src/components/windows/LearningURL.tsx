import React, { ChangeEvent } from "react";
import { APIService } from "../../util/APIService";
import toast from "react-hot-toast";

interface Item {
  url: string;
  title: string;
  remarks: string;
}

interface LearningURLProps {
  items: Item[];
  setItems: React.Dispatch<React.SetStateAction<Item[]>>;
}

const LearningURL: React.FC<LearningURLProps> = ({ items, setItems }) => {
  const handleInputChange = (
    index: number,
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = event.target;
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [name]: value };
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { url: "", title: "", remarks: "" }]);
  };

  const handleDeleteItem = (index: number) => {
    const newItems = items.filter((_, i) => i !== index);
    setItems(newItems);
  };

  const handleStartLearning = async () => {
    try {
      const token = localStorage.getItem("access_token");
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      const response = await APIService.post(
        "/learningData/urls",
        items,
        config
      );
      console.log("Response:", response.data);
      toast.success("操作は正常に続行されました。");
    } catch (error) {
      console.error("Error starting learning:", error);
      toast.error("操作に失敗しました。");
    }
  };

  return (
    <div className="pt-[24px] max-h-full h-full flex flex-col">
      <div className="bg-[#D8D8D8] pl-[33px] pr-[68px] pt-[5px] h-full max-h-full overflow-y-auto">
        {items.map((item, index) => (
          <div className="" key={index}>
            <div key={index} className="flex items-center  max-w-[1200px]">
              <div className="w-full">
                <div className="flex-1">
                  <label className="block text-md text-gray-700">URL</label>
                  <input
                    type="text"
                    name="url"
                    placeholder="こちらにリンクを入力してください"
                    value={item.url}
                    onChange={(e) => handleInputChange(index, e)}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-md font-bold text-gray-700">
                    タイトル
                  </label>
                  <input
                    type="text"
                    name="title"
                    placeholder="こちらにタイトルを入力してください"
                    value={item.title}
                    onChange={(e) => handleInputChange(index, e)}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 text-sm"
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-md font-bold text-gray-700">
                    備考
                  </label>
                  <textarea
                    name="remarks"
                    placeholder="URL内の説明テキストを入力してください。サマリーや学習方針などをセットで登録することで学習精度が上がりより良い回答が生成できるようになります"
                    value={item.remarks}
                    onChange={(e) => handleInputChange(index, e)}
                    className="mt-1 block w-full border border-gray-300 rounded-md p-2 h-24 text-sm"
                  />
                </div>
              </div>
              <div className="flex align-middle pl-[19px] justify-center">
                <button
                  type="button"
                  onClick={addItem}
                  className="rounded-full hover:bg-blue-500 m-1"
                >
                  <svg
                    version="1.1"
                    id="Capa_1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlns:xlink="http://www.w3.org/1999/xlink"
                    width="25px"
                    height="25px"
                    viewBox="0 0 363.025 363.024"
                    xml:space="preserve"
                  >
                    <g>
                      <g>
                        <path
                          style={{ fill: "#0000ff" }}
                          d="M181.512,0C81.422,0,0,81.424,0,181.513c0,100.088,81.422,181.512,181.512,181.512
      c100.089,0,181.513-81.424,181.513-181.512C363.025,81.424,281.601,0,181.512,0z M181.512,351.314
      c-93.626,0-169.802-76.175-169.802-169.802S87.886,11.71,181.512,11.71c93.627,0,169.803,76.176,169.803,169.803
      S275.139,351.314,181.512,351.314z"
                        />
                        <polygon
                          style={{ fill: "#0000ff" }}
                          points="187.368,111.25 175.658,111.25 175.658,175.657 111.25,175.657 111.25,187.368 
      175.658,187.368 175.658,251.775 187.368,251.775 187.368,187.368 251.776,187.368 251.776,175.657 187.368,175.657 		"
                        />
                      </g>
                    </g>
                  </svg>
                </button>
                <button
                  type="button"
                  onClick={() => handleDeleteItem(index)}
                  className="rounded-full hover:bg-red-500 m-1"
                >
                  <svg
                    version="1.1"
                    id="Capa_1"
                    xmlns="http://www.w3.org/2000/svg"
                    xmlnsXlink="http://www.w3.org/1999/xlink"
                    width="25px"
                    height="25px"
                    viewBox="0 0 363.025 363.024"
                    xmlSpace="preserve"
                  >
                    <g>
                      <g>
                        <path
                          style={{ fill: "#ff0000" }}
                          d="M181.512,363.024C81.43,363.024,0,281.601,0,181.513C0,81.424,81.43,0,181.512,0
        c100.083,0,181.513,81.424,181.513,181.513C363.025,281.601,281.595,363.024,181.512,363.024z M181.512,11.71
        C87.88,11.71,11.71,87.886,11.71,181.513s76.17,169.802,169.802,169.802c93.633,0,169.803-76.175,169.803-169.802
        S275.145,11.71,181.512,11.71z"
                        />
                        <rect
                          x="91.348"
                          y="179.914"
                          style={{ fill: "#ff0000" }}
                          width="188.103"
                          height="11.708"
                        />
                      </g>
                    </g>
                  </svg>
                </button>
              </div>
            </div>
            <hr className="w-full mt-[5px] mb-[5px] bg-gray-400 h-[5px] rounded shadow-md max-w-[1200px]"></hr>
          </div>
        ))}
      </div>
      <div className="flex justify-center pt-[16px] pb-[16px]">
        <button
          type="button"
          onClick={handleStartLearning}
          className="my-5 p-2 bg-[#3E3E3E] text-white rounded-[30px] w-[198px] text-md tracking-widest"
        >
          学習開始
        </button>
      </div>
    </div>
  );
};

export default LearningURL;
