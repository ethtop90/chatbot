// src/pages/auth/Login.tsx
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import { AppDispatch } from "../../app/store";
import { Button, SocialSignIn } from "../../components/Button";
import { InputField } from "../../components/Input";
import {
  loginUser,
  registerUser,
  socialRegister,
} from "../../features/auth/authSlice";
import AuthLayout from "../../layouts/AuthLayout";
import { UsersIcon } from "@heroicons/react/24/outline";
import { setSuccess } from "../../features/system/systemSlice";

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: any) => state.auth);
  const loading = auth.loading;
  const system = useSelector((state: any) => state.system);
  const [isAuthenticated, setISAuthenticated] = useState(false);
  const [disabled, setDisabled] = useState(false);
  const [custom, setCustom] = useState(false);
  const [allInputs, setAllInputs] = useState({
    email: "",
    password: "",
  });

  useEffect(() => {
    if (localStorage.getItem("operation_status") == 'success') {
      toast.success("ユーザーは正常にログインされました。");
      localStorage.setItem("operation_status", "none");
      navigate("/");
    }
  }, [auth]);

  useEffect(() => {
    if (auth?.userData?.username) setISAuthenticated(true);
    else setISAuthenticated(false);
  }, [auth?.userData?.username]);


  const handleFormChanger = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAllInputs({ ...allInputs, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDisabled(true);
    dispatch(loginUser(allInputs));
    setDisabled(false);
  };

  return (
    <>
      <div className="min-h-full flex flex-col justify-center py-12 sm:px-6 lg:px-8">
        <div className="relative">


        </div>
        <div className="sm:mx-auto sm:w-full sm:max-w-md">
          <div className="fixed p-2"><a
            href="/signup"
            className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500 underline"
          >
            サインアップ
          </a></div>

          <div className="bg-white w-fit mx-auto ">
            <UsersIcon className="h-12 w-12 mr-2 bg-white" aria-hidden="true" />
          </div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            ログイン
          </h2>
        </div>

        <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
          <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
            <form className="space-y-6" onSubmit={handleFormSubmit}>
              <div>
                <label
                  htmlFor="email"
                  className="block text-lg font-medium text-gray-700"
                >
                  メールアドレス
                </label>
                <div className="mt-1">
                  <InputField
                    id="email"
                    name="email"
                    type="email"
                    onChange={handleFormChanger}
                    required
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-lg font-medium text-gray-700"
                >
                  パスワード
                </label>
                <div className="mt-1">
                  <InputField
                    id="password"
                    name="password"
                    type="password"
                    onChange={handleFormChanger}
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor="remember-me"
                    className="ml-2 block text-sm text-gray-900"
                  >
                    ログイン情報を記憶
                  </label>
                </div>

                {/* <div className="text-sm">
                  <a
                    href="#"
                    className="font-medium text-indigo-600 hover:text-indigo-500"
                  >
                    パスワードを忘れましたか?
                  </a>
                </div> */}
              </div>

              <div>
                <Button
                  name="ログイン"
                  altText="ログイン..."
                  type="submit"
                  disabled={disabled}
                >
                  ログイン
                </Button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
