'use client'
import { io } from 'socket.io-client';

import { API_BASE_URL } from '@/lib/api';
import React from 'react';
import { useEffectOnce } from 'react-use';

const socket = io(API_BASE_URL, {
    transports: ['websocket'],
    path: '/api/socket.io',
    autoConnect: false,
});

const SocketContext = React.createContext<typeof socket>(socket);

export const ScoketProvider = ({ children }: { children: React.ReactNode }) => {
    const token = "";
    useEffectOnce(() => {
        if (token) {
            socket.auth = token;
            if (!socket.connected) {
                socket.connect();
            }
        } else {
            socket.disconnect();
        }
    });

    return (
        <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
    )
}

export const useSocket = () => React.useContext(SocketContext);