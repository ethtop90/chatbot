import { useNavigate } from "react-router-dom";
import { AdminIcon, TransactionIcon, UserIcon, LogoutIcon } from "../../assets";
import chatbot from "../../assets/images/chat-bot-logo.png";
import { useDispatch, useSelector } from "react-redux";
import { useAppDispatch } from "../../app/hooks";
import { logoutUser } from "../../features/auth/authSlice";
import { useEffect, useState } from "react";
import { Button } from "../Button";
import { setSuccess } from "../../features/system/systemSlice";
import toast from "react-hot-toast";
import path from "path";
import { configureStore } from "@reduxjs/toolkit";

export let isAuthenticated: boolean = false;

const styles = {
  active:
    "w-full h-[40px] bg-[#D9D9D999] flex pl-10 items-center space-x-6  p-4",
  inActive:
    "w-full h-[40px] flex items-center pl-10 space-x-6 hover:bg-[#1c1c1d]  p-4",
  smallActive:
    "w-full h-[30px] bg-[#D9D9D999] flex pl-14 items-center space-x-6   p-4",
  smallInActive:
    "w-full h-[30px] flex items-center pl-14 space-x-6 hover:bg-[#1c1c1d]   p-4",
};

const navItems = [
  { id: 1, label: "学習させる", isLarge: true, path: "/learning" },
  {
    id: 2,
    label: "シナリオ登録",
    isLarge: true,
    path: "/scenario-registration",
    component: "ScenarioRegistration",
  },
  { id: 3, label: "ログ管理", isLarge: true, path: "/log-management" },
  {
    id: 4,
    label: "学習ログ",
    isLarge: false,
    path: "/log-management/learning",
    component: "LogLearning",
  },
  {
    id: 5,
    label: "会話ログ",
    isLarge: false,
    path: "/log-management/chat",
    component: "LogChat",
  },
  {
    id: 6,
    label: "フィードバックログ",
    isLarge: false,
    path: "/log-management/feedback",
    component: "LogFeedback",
  },
];

const Sidebar = ({
  handleComponentSelect,
}: {
  handleComponentSelect: Function;
}) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const auth = useSelector((state: any) => state.auth);
  const [isAuthenticated, setISAuthenticated] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [current, setCurrent] = useState(1);

  const renderNavItems = () => {
    return navItems.map((item) => (
      <button
        key={item.id}
        className={
          current === item.id
            ? item.isLarge
              ? styles.active
              : styles.smallActive
            : item.isLarge
            ? styles.inActive
            : styles.smallInActive
        }
        onClick={() => handleNavItem(item.id)}
      >
        <p className="text-base font-medium text-white">{item.label}</p>
      </button>
    ));
  };

  const handleNavItem = (id: number) => {
    setCurrent(id);
    handleComponentSelect(id);
  };

  const handleLogout = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDisabled(true);
    dispatch(logoutUser({ access_token: auth?.access_token }));
    setDisabled(false);
  };

  const handleLogin = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    navigate("/login");
  };

  const handleSignup = (e: React.MouseEvent<HTMLButtonElement>) => {
    navigate("/signup");
  };

  useEffect(() => {
    if (localStorage.getItem("operation_status") == "success") {
      toast.success("ユーザーが脱退した。");
      setISAuthenticated(false);
      localStorage.setItem("operation_status", "none");
    }
  }, [auth]);

  useEffect(() => {
    if (isAuthenticated) {
      if (auth?.access_token)
        localStorage.setItem("access_token", auth?.access_token);
    } else {
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (auth?.userData?.username) {
      setISAuthenticated(true);
    } else {
      setISAuthenticated(false);
    }
    handleComponentSelect(1);
  }, []);

  return (
    <div className="w-full top-0 left-0 bottom-0 h-screen flex flex-col w-[230px]   bg-[#202020] flow-hide  ">
      <div className="relative flex flex-col items-center w-full h-screen">
        <div className="flex justify-center mt-12">
          {/* <h1 className="text-white">YOUR LOGO HERE</h1> */}
          <img src={chatbot} alt="チャットボット" className="w-20 h-20" />
        </div>
        <div className="flex flex-col items-center my-[20px]">
          <p className="text-base font-bold text-white">
            {auth?.userData?.username}
          </p>
        </div>
        <div className="flex flex-col items-center w-full mt-10 space-y-2">
          {renderNavItems()}
        </div>

        <div className="absolute bottom-[120px] left-0 right-0">
          {isAuthenticated ? (
            <button
              className=" w-[256px] h-[64px]  flex  items-center pl-10 space-x-6 mx-auto "
              onClick={handleLogout}
            >
              <LogoutIcon />
              <p className="text-[#DA3F51] font-medium text-base ">
                ログアウト
              </p>
            </button>
          ) : (
            <div className="flex flex-col justify-center align-middle px-auto">
              <div className="p-5">
                <Button
                  className="mx-auto"
                  width={20}
                  name="ログイン"
                  onClick={handleLogin}
                >
                  ログイン
                </Button>
              </div>
              <div className="p-5">
                <Button
                  className="mx-auto"
                  width={20}
                  name="サインアップ"
                  onClick={handleSignup}
                >
                  サインアップ
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
