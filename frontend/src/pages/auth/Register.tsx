// src/pages/auth/Register.tsx
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { useAppSelector } from "../../app/hooks";
import { AppDispatch } from "../../app/store";
import { Button, SocialSignIn } from "../../components/Button";
import { InputField } from "../../components/Input";
import { registerUser, socialRegister } from "../../features/auth/authSlice";
import { setSuccess } from "../../features/system/systemSlice";
import AuthLayout from "../../layouts/AuthLayout";

const Signup = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const auth = useSelector((state: any) => state.auth);
  const loading = auth.loading;
  const system = useSelector((state: any) => state.system);
  const passwordValidator = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,}$/;
  const [disabled, setDisabled] = useState(false);
  const [allInputs, setAllInputs] = useState({
    email: "",
    password: "",
    firstname: "",
    lastname: "",
    phone: "",
  });

  useEffect(() => {
    if (localStorage.getItem('operation_status')=='success') {
      console.log(auth);
      toast.success("ユーザーは正常にログインされました");
      localStorage.setItem("operation_status", "none");
      navigate("/login");
    }
  }, [auth]);

  const handleFormChanger = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAllInputs({ ...allInputs, [e.target.name]: e.target.value });
  };

  const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setDisabled(true);
    if (!allInputs.password.match(passwordValidator)) {
      toast.error(
        "パスワードは英数字で、大文字と小文字を含む 8 文字以上である必要があります"
      );
    } else {
      dispatch(registerUser(allInputs));
    }
    setDisabled(false);
  };

  return (
    <AuthLayout>
      <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
        <div className="sm:mx-auto sm:w-full sm:max-w-sm">
          <div className="flex justify-center align-middle mt-20 mx-auto w-20">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 16 16"
              fill="currentColor"
              className="size-4"
            >
              <path
                fillRule="evenodd"
                d="M15 8A7 7 0 1 1 1 8a7 7 0 0 1 14 0Zm-5-2a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM8 9c-1.825 0-3.422.977-4.295 2.437A5.49 5.49 0 0 0 8 13.5a5.49 5.49 0 0 0 4.294-2.063A4.997 4.997 0 0 0 8 9Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
            アカウントを作成{" "}
          </h2>
        </div>

        <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
          <form className="space-y-6" onSubmit={handleFormSubmit}>
            
              <>
                <div>
                  <label
                    htmlFor="firstname"
                    className="block text-lg font-medium leading-6 text-gray-900"
                  >
                    名
                  </label>
                  <div className="mt-2">
                    <InputField
                      id="firstname"
                      name="firstname"
                      type="text"
                      onChange={handleFormChanger}
                      required
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="lastname"
                    className="block text-lg font-medium leading-6 text-gray-900"
                  >
                    姓
                  </label>
                  <div className="mt-2">
                    <InputField
                      id="lastname"
                      name="lastname"
                      type="text"
                      onChange={handleFormChanger}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="phone"
                    className="block text-lg font-medium leading-6 text-gray-900"
                  >
                    電話番号
                  </label>
                  <div className="mt-2">
                    <InputField
                      id="phone"
                      name="phone"
                      type="tel"
                      onChange={handleFormChanger}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label
                    htmlFor="email"
                    className="block text-lg font-medium leading-6 text-gray-900"
                  >
                    メールアドレス
                  </label>
                  <div className="mt-2">
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
                  <div className="flex items-center justify-between">
                    <label
                      htmlFor="password"
                      className="block text-lg font-medium leading-6 text-gray-900"
                    >
                      パスワード
                    </label>
                  </div>
                  <div className="mt-2">
                    <InputField
                      onChange={handleFormChanger}
                      id="password"
                      name="password"
                      type="password"
                      required
                    />
                  </div>
                </div>

                <div>
                  <Button
                    loading={loading}
                    name="サインアップ"
                    altText="サインアップ..."
                    type="submit"
                    disabled={disabled}
                  />
                </div>
              </>
          </form>

          <p className="mt-10 text-center text-sm text-gray-500">
            すでにメンバーですか?{" "}
            <a
              href="/login"
              className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500 underline"
            >
              ここからログイン
            </a>
          </p>
        </div>
      </div>
    </AuthLayout>
  );
};

export default Signup;
