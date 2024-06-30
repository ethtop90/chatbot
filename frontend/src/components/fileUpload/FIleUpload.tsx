import React, { useRef } from "react";
import { FaTimes, FaTrash } from "react-icons/fa";
import "./style.css";

const SuccessIcon = () => (
  <svg
    height="50px"
    width="50px"
    version="1.1"
    id="Capa_1"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 50 50"
    xmlSpace="preserve"
  >
    <circle style={{ fill: "#25AE88" }} cx="25" cy="25" r="25" />
    <polyline
      style={{
        fill: "none",
        stroke: "#FFFFFF",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeLinejoin: "round",
        strokeMiterlimit: 10,
      }}
      points="38,15 22,33 12,25"
    />
  </svg>
);

const FailedIcon = () => (
  <svg
    height="50px"
    width="50px"
    version="1.1"
    id="Capa_1"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 50 50"
    xmlSpace="preserve"
  >
    <circle style={{ fill: "#EFCE4A" }} cx="25" cy="25" r="25" />
    <line
      style={{
        fill: "none",
        stroke: "#FFFFFF",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeMiterlimit: 10,
      }}
      x1="25"
      y1="10"
      x2="25"
      y2="32"
    />
    <line
      style={{
        fill: "none",
        stroke: "#FFFFFF",
        strokeWidth: 2,
        strokeLinecap: "round",
        strokeMiterlimit: 10,
      }}
      x1="25"
      y1="37"
      x2="25"
      y2="39"
    />
  </svg>
);

const UploadingIcon = () => (
  <svg
    height="50px"
    width="50px"
    version="1.1"
    id="Layer_1"
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    viewBox="0 0 496 496"
    xmlSpace="preserve"
  >
    <circle style={{ fill: "#383A39" }} cx="248" cy="24" r="24" />
    <circle style={{ fill: "#ECEEEE" }} cx="248" cy="472" r="24" />
    <circle style={{ fill: "#77807F" }} cx="136" cy="53.6" r="24" />
    <path
      style={{ fill: "#F2F4F4" }}
      d="M380.8,430.4c6.4,11.2,2.4,25.6-8.8,32.8c-11.2,6.4-25.6,2.4-32.8-8.8c-6.4-11.2-2.4-25.6,8.8-32.8
	C359.2,415.2,374.4,419.2,380.8,430.4z"
    />
    <path
      style={{ fill: "#9FAAA9" }}
      d="M65.6,115.2c11.2,6.4,15.2,20.8,8.8,32.8c-6.4,11.2-20.8,15.2-32.8,8.8c-11.2-6.4-15.2-20.8-8.8-32.8
	S54.4,108.8,65.6,115.2z"
    />
    <path
      style={{ fill: "#F2F7F7" }}
      d="M454.4,339.2c11.2,6.4,15.2,20.8,8.8,32.8c-6.4,11.2-20.8,15.2-32.8,8.8
	c-11.2-6.4-15.2-20.8-8.8-32.8C428,336.8,442.4,332.8,454.4,339.2z"
    />
    <circle style={{ fill: "#B2BBBA" }} cx="24" cy="248" r="24" />
    <circle style={{ fill: "#FFFFFF" }} cx="472" cy="248" r="24" />
    <path
      style={{ fill: "#C5CCCB" }}
      d="M41.6,339.2c11.2-6.4,25.6-2.4,32.8,8.8c6.4,11.2,2.4,25.6-8.8,32.8c-11.2,6.4-25.6,2.4-32.8-8.8
	S30.4,346.4,41.6,339.2z"
    />
    <path
      d="M430.4,115.2c11.2-6.4,25.6-2.4,32.8,8.8c6.4,11.2,2.4,25.6-8.8,32.8c-11.2,6.4-25.6,2.4-32.8-8.8
	C415.2,136.8,419.2,121.6,430.4,115.2z"
    />
    <path
      style={{ fill: "#D9DDDD" }}
      d="M115.2,430.4c6.4-11.2,20.8-15.2,32.8-8.8c11.2,6.4,15.2,20.8,8.8,32.8c-6.4,11.2-20.8,15.2-32.8,8.8
	C112.8,456,108.8,441.6,115.2,430.4z"
    />
    <path
      style={{ fill: "#111111" }}
      d="M339.2,41.6c6.4-11.2,20.8-15.2,32.8-8.8c11.2,6.4,15.2,20.8,8.8,32.8c-6.4,11.2-20.8,15.2-32.8,8.8
	C336.8,68,332.8,53.6,339.2,41.6z"
    />
  </svg>
);

interface UploadStatus {
  fileName: string;
  fileSize: number; // Size in KB
  status: "inProgress" | "failure" | "success";
  progress: number; // Percentage
  remainingTime: number; // Seconds
}

interface FileUploadProps {
  onFileChange: (files: File[]) => void;
  uploadStatuses: UploadStatus[];
  setUploadStatuses: React.Dispatch<React.SetStateAction<UploadStatus[]>>;
}

const FileUpload: React.FC<FileUploadProps> = ({
  onFileChange,
  uploadStatuses,
  setUploadStatuses,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    console.log("In FileUpload, files are changed");

    if (event.target.files) {
      const newFiles = Array.from(event.target.files);
      onFileChange(newFiles);

      const newUploads = newFiles.map((file) => ({
        fileName: file.name,
        fileSize: Math.round(file.size / 1024), // Convert to KB
        status: "inProgress" as "inProgress",
        progress: 0,
        remainingTime: 0,
      }));

      setUploadStatuses((prevUploads) => [...prevUploads, ...newUploads]);
      uploadFiles(newUploads);
    }
  };

  const uploadFiles = (files: UploadStatus[]) => {
    files.forEach((file, index) => {
      const interval = setInterval(() => {
        setUploadStatuses((prevUploads) => {
          const updatedUploads = [...prevUploads];
          const fileIndex = updatedUploads.findIndex(
            (f) => f.fileName === file.fileName
          );

          if (fileIndex !== -1) {
            const newProgress = updatedUploads[fileIndex].progress + 10;

            if (newProgress >= 100) {
              updatedUploads[fileIndex].status = "success";
              updatedUploads[fileIndex].progress = 100;
              clearInterval(interval);
            } else {
              updatedUploads[fileIndex].progress = newProgress;
              updatedUploads[fileIndex].remainingTime = Math.ceil(
                (100 - newProgress) / 10
              );
            }
          }
          return updatedUploads;
        });
      }, 400);
    });
  };

  const closeUpload = (index: number) => {
    setUploadStatuses((uploads) => uploads.filter((_, i) => i !== index));
  };

  return (
    <div className="pt-[40px] px-auto">
      <h1 className="pb-[30px]">ファイルアップロード</h1>
      <div className="border-4 border-dashed py-[40px] border-[#7CA5C2] rounded-lg bg-[#EAF4FE] w-[500px] flex flex-col justify-center mx-auto">
        <div className="flex justify-center">
          <svg
            width="128px"
            height="128px"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <g>
              <path fill="none" d="M0 0h24v24H0z" />
              <path
                style={{ fill: "#A0D3FD" }}
                d="M12 12.586l4.243 4.242-1.415 1.415L13 16.415V22h-2v-5.587l-1.828 1.83-1.415-1.415L12 12.586zM12 2a7.001 7.001 0 0 1 6.954 6.194 5.5 5.5 0 0 1-.953 10.784v-2.014a3.5 3.5 0 1 0-1.112-6.91 5 5 0 1 0-9.777 0 3.5 3.5 0 0 0-1.292 6.88l.18.03v2.014a5.5 5.5 0 0 1-.954-10.784A7 7 0 0 1 12 2z"
              />
            </g>
          </svg>
        </div>
        <span className="w-[350px] mx-auto text-center p-[10px]">
          ここにファイルをドロップ
        </span>
        <span className="text-center p-[10px]">または</span>
        <div className="px-auto flex justify-center">
          <button
            className="border-2 border-[#7CA5C2] w-[250px] rounded-md bg-white p-[5px] text-[#7CA5C2]"
            onClick={() => fileInputRef.current?.click()}
          >
            ファイルを選択
          </button>
        </div>
      </div>
      <div className="border-none rounded-lg w-[500px]">
        <input
          type="file"
          ref={fileInputRef}
          className="hidden"
          multiple
          onChange={handleFileChange}
        />
        {uploadStatuses.map((upload, index) => (
          <div
            key={index}
            className="flex items-center space-x-4 p-4 border rounded-md bg-white my-[20px] text-[12px]"
          >
            <div
              className={`${
                upload.status === "inProgress" ? "animate-spin" : ""
              }`}
            >
              {upload.status === "success" && <SuccessIcon />}
              {upload.status === "failure" && <FailedIcon />}
              {upload.status === "inProgress" && <UploadingIcon />}
            </div>
            <div className="flex flex-col w-[150px]">
              <p className="font-bold text-[16px] w-full">{upload.fileName}</p>
              <span className="text-gray-400">
                ファイルサイズ: {upload.fileSize} KB
              </span>
            </div>
            <div className="flex flex-col flex-grow">
              <span>
                残り{upload.remainingTime}秒 ({upload.progress}%)
              </span>
              <div className="relative w-full h-5 bg-gray-200 rounded-full overflow-hidden p-1">
                <div
                  className={`h-full rounded-full ${
                    upload.status === "success"
                      ? "bg-green-500"
                      : upload.status === "failure"
                      ? "bg-red-500"
                      : "bg-blue-500"
                  }`}
                  style={{ width: `${upload.progress}%` }}
                />
              </div>
            </div>
            <div className="border-2 w-[30px] h-[30px] rounded-full px-auto flex justify-center hover:bg-red-500">
              <button onClick={() => closeUpload(index)} className="">
                {upload.status === "inProgress" ? (
                  <FaTimes color="#CBD5E0" />
                ) : (
                  <FaTrash color="#CBD5E0" />
                )}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FileUpload;
