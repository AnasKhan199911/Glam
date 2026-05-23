import React from 'react';
import ChatWidget from './ChatWidget';

const UserChat = () => {
    const userStr = localStorage.getItem('user');
    const isAdminToken = localStorage.getItem('adminToken');

    // If we are logged in as admin (adminToken exists), don't show the user chat toggle
    if (isAdminToken) return null;

    let user = null;
    try {
        user = userStr ? JSON.parse(userStr) : null;
    } catch (e) {
        user = null;
    }

    // If user is the system admin (by email), don't show the floating toggle
    if (user && user.email === 'admin@glamconnect.com') return null;

    // The target receiver is the admin. 
    // Since you are using demo credentials, the Admin ID is 999
    const adminId = 999;

    // For guests, we provide a placeholder or you might want to force login.
    // For now, let's show it for logged-in users only to avoid database errors with guest IDs
    if (!user) return null;

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
