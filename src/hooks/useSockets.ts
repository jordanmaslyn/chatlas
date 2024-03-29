import { useEffect, useState } from 'react';
import io, { Socket } from 'socket.io-client';

export function useSockets(roomId: string) {
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    if (!roomId) return;

    fetch('/api/socketio').finally(() => {
      const socket = io({ transports: ['websocket', 'polling'] });
      setSocket(socket);

      socket.on('connect', () => {
        console.log('connect');
        socket.emit('hello', roomId);
      });

      socket.on('a user connected', () => {
        console.log('a user connected');
      });

      socket.on('disconnect', () => {
        console.log('disconnect');
      });

      socket.on('connect_error', () => {
        // revert to classic upgrade
        socket.io.opts.transports = ['polling', 'websocket'];
      });
    });

    return () => {
      console.log('cleaning up useSockets hook');
      socket?.disconnect();
    };
  }, [roomId]);

  return socket;
}
