import React, { useState, useEffect } from 'react';
import ChatWidget from './ChatWidget';
import axios from '../api/axiosConfig';

const UserChat = () => {
    const userStr = localStorage.getItem('user');
    const isAdminToken = localStorage.getItem('adminToken');
    const [adminId, setAdminId] = useState(null);

    useEffect(() => {
        axios.post('/auth/get-admin-id')
            .then(res => { if (res.data.success) setAdminId(res.data.admin_id); })
            .catch(() => setAdminId(5));
    }, []);

    if (isAdminToken) return null;

    let user = null;
    try {
        user = userStr ? JSON.parse(userStr) : null;
    } catch (e) {
        user = null;
    }

    if (user && user.email === 'admin@glamconnect.com') return null;
    if (!user) return null;
    if (!adminId) return null;

    return (
        <ChatWidget
            currentUser={user}
            receiverId={adminId}
            receiverType="admin"
            isAdmin={false}
        />
    );
};

export default UserChat;
