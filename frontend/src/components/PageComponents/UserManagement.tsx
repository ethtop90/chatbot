// frontend/src/components/UserManagement.tsx

import React, { useState, useEffect } from 'react';
import { APIService } from '../../util/APIService';
import toast from 'react-hot-toast';
import UserEdit from './UserEdit';

interface User {
    _id: string;
    registrationDate: string;
    customerId: string;
    username: string;
    email: string;
    phone: string;
    admin_note: string;
    status: boolean;
}

const UserManagement: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [status, setStatus] = useState<'display' | 'edit' | 'add'>('display');
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const token = localStorage.getItem('access_token');
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const fetchUsers = async () => {
        try {
            console.log("token:", token);
            const response = await APIService.get<User[]>("/users/", config);
            setUsers(response.data);
            toast.success('ユーザー情報が取得されました');
        } catch (err) {
            toast.error('ユーザー情報の取得に失敗しました');
        }
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    const handleAddUser = () => {
        setCurrentUser(null);
        setStatus('add');
    };

    const handleEditUser = (user: User) => {
        setCurrentUser(user);
        setStatus('edit');
    };

    const handleDeleteUser = async (id: string) => {
        if (window.confirm('このユーザーを削除してもよろしいですか？')) {
            try {
                await APIService.delete(`/users/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });
                setUsers((prevUsers) => prevUsers.filter((user) => user._id !== id));
                toast.success('ユーザーが削除されました');
            } catch (err) {
                toast.error('ユーザーの削除に失敗しました');
            }
        }
    };

    const handleStatusChange = async (user: User) => {
        try {
            const updatedUser = { ...user, status: !user.status };
            await APIService.put(`/users/${user._id}`, updatedUser, config);
            setUsers((prevUsers) =>
                prevUsers.map((u) => (u._id === user._id ? updatedUser : u))
            );
            toast.success('ユーザーのステータスが更新されました');
        } catch (err) {
            toast.error('ユーザーのステータスの更新に失敗しました');
        }
    };

    return (
        <div className="flex flex-col justify-start p-4 h-full overflow-auto">
            {status === 'display' ? (
                <>
                    <h1 className="text-2xl font-bold mb-4">ユーザー管理</h1>
                    <button
                        className="mb-4 px-4 py-2 text-white bg-gradient-to-r from-orange-600 to-yellow-400 rounded-full font-bold text-sm w-40"
                        onClick={handleAddUser}
                    >
                        新規ユーザー登録
                    </button>
                    <div className="flex flex-col h-full overflow-auto">
                        <table className="min-w-full border-collapse ">
                            <thead>
                                <tr>
                                    <th className="border px-4 py-2">登録日</th>
                                    <th className="border px-4 py-2">顧客ID</th>
                                    <th className="border px-4 py-2">顧客名</th>
                                    <th className="border px-4 py-2">メールアドレス</th>
                                    <th className="border px-4 py-2">電話番号</th>
                                    <th className="border px-4 py-2">ステータス</th>
                                    <th className="border px-4 py-2">アクション</th>
                                </tr>
                            </thead>
                            <tbody>
                                {users.map((user, index) => (
                                    <tr key={user._id}>
                                        <td className="border px-4 py-2">{user.registrationDate}</td>
                                        <td className="border px-4 py-2 text-center">{index + 1}</td>
                                        <td className="border px-4 py-2">{user.username}</td>
                                        <td className="border px-4 py-2">{user.email}</td>
                                        <td className="border px-4 py-2">{user.phone}</td>
                                        <td className="border py-2 text-center">
                                            <label className="relative inline-flex items-center cursor-pointer ">
                                                <input
                                                    type="checkbox"
                                                    className="sr-only peer"
                                                    checked={user.status}
                                                    onChange={() => handleStatusChange(user)}
                                                />
                                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-orange-300 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-gradient-to-r from-orange-600 to-yellow-400"></div>
                                            </label>
                                        </td>
                                        <td className="border px-4 py-2">
                                            <div className="flex space-x-2 justify-center">
                                                <button
                                                    className="px-4 py-2 text-white bg-blue-500 rounded hover:bg-blue-600 active:bg-blue-700"
                                                    onClick={() => handleEditUser(user)}
                                                >
                                                    編集
                                                </button>
                                                <button
                                                    className="px-4 py-2 text-white bg-red-500 rounded hover:bg-red-600 active:bg-red-700"
                                                    onClick={() => handleDeleteUser(user._id)}
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
                </>
            ) : (
                <UserEdit user={currentUser} setStatus={setStatus} fetchUsers={fetchUsers} />
            )}
        </div>
    );
};

export default UserManagement;
