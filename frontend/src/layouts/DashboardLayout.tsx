// src/layouts/DashboardLayout.tsx
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import HeadNav from "../components/general/headnav";
import Sidebar from "../components/general/sidebar";
import { render } from "@headlessui/react/dist/utils/render";
import Learning from "../components/PageComponents/Learning";
import LearningLog from "../components/PageComponents/LearningLog";
interface dashboard {
  children?: any;
  current: number;
}

const DashboardLayout: React.FC<dashboard> = ({ children }: dashboard) => {
  const navigate = useNavigate();
  const [componentId, setComponentId] = useState(1);

  const handleComponentSelect = (id: number) => {
    setComponentId(id);
  };

  const renderComponent = () => {
    switch (componentId) {
      case 1:
        return <Learning />;
      // case 2:
      //   return <ScenarioRegistration />;
      // case 3:
      //   return <LogManagement />;
      case 4:
        return <LearningLog />;
      // case 5:
      //   return <LogChat />;
      // case 6:
      //   return <LogFeedback />;
      default:
        return null;
    }
  };

  return (
    <div className="flex flex-row w-full">
      <div className="w-full h-screen bg-[#f6f6f6] relative  md:flex hidden ">
        <div className="">
          <Sidebar handleComponentSelect={handleComponentSelect} />
        </div>
        <div className=" flex flex-col flex-grow h-full flow-hide bg-[#202020] pt-[12px] pr-[14px] pb-[16px]">
          {/* <div className="w-full h-[95vh] flow-hide px-12">{children}</div> */}
          <div className="bg-white w-full h-full max-h-full rounded-r p-[32px]" >{renderComponent()}</div>
        </div>
      </div>
    </div>
  );
};

export default DashboardLayout;
