// src/pages/Logout.js
import React, { useEffect } from 'react';
import { Cookies } from 'react-cookie';
import { useNavigate } from 'react-router-dom';
import { useWebSocket } from 'src/utils/webSocketProvider';

const Logout: React.FC = () => {
    const navigate = useNavigate();
    const cookies = new Cookies();
    const socket = useWebSocket()
    useEffect(() => {
        // Remove the authentication cookie(s)
        cookies.remove('token', { path: '/' }); // Replace 'authToken' with your actual cookie name
        localStorage.removeItem('selectedFranchise');
        localStorage.removeItem('selectedLocations');
        if(socket){
            socket.disconnect()

        }
        sessionStorage.clear();

        // Redirect to the login page after logging out
        navigate('/login');
    }, [navigate, cookies]);

    return null; // No UI needed for logout
};

export default Logout;
