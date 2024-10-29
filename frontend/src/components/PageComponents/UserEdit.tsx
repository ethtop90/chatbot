// frontend/src/components/UserEdit.tsx

import React, { useEffect, useState } from 'react';
import { APIService } from '../../util/APIService';
import toast from 'react-hot-toast';

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

interface UserEditProps {
    user: User | null;
    setStatus: (status: 'display' | 'edit' | 'add') => void;
    fetchUsers: () => void;
}

const UserEdit: React.FC<UserEditProps> = ({ user, setStatus, fetchUsers }) => {
    const [username, setusername] = useState(user?.username || '');
    const [email, setEmail] = useState(user?.email || '');
    const [phone, setPhone] = useState(user?.phone || '');
    const [code, setCode] = useState('');
    const [admin_note, setadmin_note] = useState(user?.admin_note || '');
    const token = localStorage.getItem('access_token');
    const config = {
        headers: {
            Authorization: `Bearer ${token}`,
        },
    };

    const handleSave = async () => {
        try {
            if (user) {
                await APIService.put(`/users/${user._id}`, { username, email, phone, admin_note }, config);
                toast.success('ユーザーが更新されました');
            } else {
                await APIService.post('/users/', { username, email, phone, admin_note }, config);
                toast.success('新規ユーザーが作成されました');
            }
            fetchUsers();
            setStatus('display');
        } catch (err) {
            toast.error('保存に失敗しました');
        }
    };

    const handleGenerateCode = async () => {
        try {
            const response = await APIService.post('/users/generateCode', { username, email }, config);
            setCode(response.data.code);
            toast.success('コードが生成されました');
        } catch (err) {
            toast.error('コードの生成に失敗しました');
        }
    };

    useEffect(() => {
        console.log("user admin_note:", admin_note);
    }, [])

    return (
        <div className="flex flex-col space-y-4">
            <label className="font-bold">顧客名</label>
            <input
                type="text"
                value={username}
                onChange={(e) => setusername(e.target.value)}
                className="w-full p-2 border rounded"
            />
            <label className="font-bold">メールアドレス</label>
            <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-2 border rounded"
            />
            <label className="font-bold">電話番号</label>
            <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full p-2 border rounded"
            />
            <label className="font-bold">コード発行</label>
            <button
                className="mb-4 px-4 py-2 text-white bg-gradient-to-r from-orange-600 to-yellow-400 rounded-full font-bold text-sm w-40"
                onClick={handleGenerateCode}
            >
                コード発行
            </button>
            <textarea
                value={code}
                readOnly
                className="w-full h-32 p-2 mt-2 border rounded"
            />
            <label className="font-bold">管理者メモ</label>
            <textarea
                value={admin_note}
                onChange={(e) => setadmin_note(e.target.value)}
                className="w-full h-32 p-2 border rounded"
            />
            <div className="flex justify-end space-x-4">
                <button
                    className="px-4 py-2 text-white bg-green-500 rounded hover:bg-green-600 active:bg-green-700"
                    onClick={handleSave}
                >
                    保存
                </button>
                <button
                    className="px-4 py-2 text-white bg-gray-500 rounded hover:bg-gray-600 active:bg-gray-700"
                    onClick={() => setStatus('display')}
                >
                    キャンセル
                </button>
            </div>
        </div>
    );
};

export default UserEdit;
