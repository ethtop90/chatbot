import { BrowserRouter, Route, Routes, useNavigation } from "react-router-dom";

import Home from "./pages/Home/";
import Login from "./pages/auth/Login";
import Signup from "./pages/auth/Register";
import VerifyEmail from "./pages/auth/VerifyEmail";
import Profile from "./pages/profile";
import Transactions from "./pages/Transactions";

import ProtectedRoute from "./ProtectedRoute";
import NotFound from "./pages/Error/NotFound";
import Users from "./pages/users";
import Testing from "./pages/profile/Testing";
import NavBar from "./components/Navbar";
import UserManagement from "./components/PageComponents/UserManagement";
import { useSelector } from "react-redux";
import { useEffect } from "react";
import Chatbot from "./pages/chatbot";
import ChatLog from "./components/PageComponents/ChatLog";

const AppRoutes = () => {
  const auth = useSelector((state: any) => state.auth);
  const username = localStorage.getItem('username');


  return (
    <BrowserRouter>
      {/* <NavBar /> */}
      <Routes>
        <Route path="/signup" element={<Signup />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route
          path="/"
          element={auth?.userData?.username ? <Home key={'home'}/> : <Login key={'login'}/>}
          // element={<Home />}
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />

        {/* Broken Link */}
        <Route path="/chatbot" element={<Chatbot />} />
        <Route path="/chatLog" element={<ChatLog />} />
        <Route path="/user" element={<UserManagement />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
