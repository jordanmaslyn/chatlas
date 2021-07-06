import { GetStaticPropsContext } from 'next';
import Head from 'next/head';
import React, { useEffect, useRef, useState } from 'react';
import {
  ChatRoom,
  prepareReactRender,
  useHydrateCache,
  useQuery,
} from 'client';
import { PropsWithServerCache } from '@gqless/react';
import { useRouter } from 'next/router';
import { useSockets } from 'hooks/useSockets';
import styles from './Room.module.css';

type PageProps = PropsWithServerCache<{
  room: ChatRoom;
}>;

export default function Page({ cacheSnapshot }: PageProps) {
  useHydrateCache({
    cacheSnapshot,

    // If it should refetch everything after the component is mounted
    // By default 'shouldRefetch' is `false` (You can change it in the 'defaults' option)
    shouldRefetch: false,
  });

  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState([
    { message: 'Messages will show up here', timestamp: Date.now() },
  ]);
  const query = useQuery();
  const router = useRouter();
  const socket = useSockets(router?.query.id as string);
  const windowEl = useRef(null);

  const room = query.chatRoom({ id: router?.query.id as string });

  const updateChat = (newMessage: string, timestamp: number) => {
    const isScrolledToBottom =
      Math.abs(
        windowEl.current.scrollTop -
        (windowEl.current.scrollHeight - windowEl.current.offsetHeight),
      ) < 30;
    setChatHistory((messages) => [
      ...messages,
      { message: newMessage, timestamp },
    ]);
    if (isScrolledToBottom) {
      setTimeout(() => {
        windowEl.current.scrollTop =
          windowEl.current.scrollHeight - windowEl.current.offsetHeight;
      }, 100);
    }
  };

  const handleMessageSend = (event) => {
    event.preventDefault();
    const timestamp = Date.now();
    socket.emit('say', { message, timestamp }, router?.query.id);
    updateChat(message, timestamp);
    setMessage('');
  };

  useEffect(() => {
    socket?.on('say', ({ message: incomingMessage, timestamp }) => {
      updateChat(incomingMessage, timestamp);
    });
  }, [socket]);

  return (
    <>
      <Head>
        <title>
          {room.roomName} - Chatlas!</title>
      </Head>

      <main>
        <h1>
          Now Chatting in "{room.roomName}
          "
        </h1>
        <div dangerouslySetInnerHTML={{ __html: room.roomDescription }} />
        <div className={styles.window} ref={windowEl}>
          {chatHistory.map(({ message: historyMessage, timestamp }) => {
            return (
              <div
                key={`${historyMessage}-${timestamp}`}
                className={styles.message}>
                {historyMessage}
              </div>
            );
          })}
        </div>
        <form onSubmit={handleMessageSend}>
          <input
            type="text"
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            className={styles.input}
            name="message"
            id="message"
            maxLength={255}
          />
          <button className={styles.button} type="submit">
            Send Message
          </button>
        </form>
      </main>
    </>
  );
}

export async function getStaticProps(context: GetStaticPropsContext) {
  const room: ChatRoom = null;

  const { cacheSnapshot } = await prepareReactRender(<Page room={room} />);

  return {
    props: {
      room,
      cacheSnapshot,
    },
    revalidate: 1,
  };
}

export async function getStaticPaths() {
  return {
    paths: ['/rooms/cG9zdDo2', '/rooms/cG9zdDo3'],
    fallback: true,
  };
}
