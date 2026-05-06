import React from 'react';
import ChatWidget from './ChatWidget';

const UserChat = () => {
    const userStr = localStorage.getItem('user');
    const isAdminToken = localStorage.getItem('adminToken');
    
    if (!userStr || isAdminToken) return null;
    
    const user = JSON.parse(userStr);
    
    // Don't show floating chat for the system admin itself
    if (user.id === 5 || user.email === 'admin@glamconnect.com') return null;
    
    // The System Administrator ID is 5 in the database
    const adminId = 5; 

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
