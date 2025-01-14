import queryString from 'query-string';
import React, { useEffect, useState } from 'react';
import { io } from 'socket.io-client';

import { showNotification } from '../utils/notification';
import InfoBar from './InfoBar';
import Input from './Input';
import Messages from './Messages';
import Navbar from './Navbar';

let socket;

const Chat = ({ location }) => {
  const [name, setName] = useState('');
  const [room, setRoom] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const ENDPOINT =
    import.meta.env.MODE === 'development' ? 'http://localhost:8000/' : 'https://chatcus-prod-dlpvkpimfa-uc.a.run.app';

  useEffect(() => {
    const { name, room, pfp: pfpSrc } = queryString.parse(location.search);
    setName(name);
    setRoom(room);

    console.log(`ENDPOINT = ${ENDPOINT}`);

    socket = io(ENDPOINT, {
      transports: ['websocket'],
      withCredentials: true,
    });

    socket.emit('join', { name, room, pfpSrc }, (error) => {
      if (error) {
        alert(error);
      }
    });

    return () => {
      socket.emit('disconnect');
      socket.off();
    };
  }, [ENDPOINT, location.search]);

  useEffect(() => {
    socket.on('message', (message) => {
      showNotification(message);
      setMessages((messages) => [...messages, message]);
    });
  }, []);

  const sendMessage = (message, callback) => {
    if (message) {
      socket.emit('sendMessage', message, () => callback());
    }
  };

  return (
    <div>
      <Navbar />
      <div className="flex flex-col items-center pt-16 bg-green-50 h-screen w-screen pt-32 overflow-y-hidden">
        <InfoBar room={room} name={name} />
        <Messages messages={messages} name={name} />
        <Input message={message} setMessage={setMessage} sendMessage={sendMessage} />
      </div>
    </div>
  );
};

export default Chat;
