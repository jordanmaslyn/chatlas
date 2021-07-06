import { GetStaticPropsContext } from 'next';
import Head from 'next/head';
import React, { useEffect, useRef, useState } from 'react';
import { ChatRoom, prepareReactRender, useHydrateCache, useQuery } from 'client';
import { PropsWithServerCache } from '@gqless/react';
import { useRouter } from 'next/router';
import styles from './Room.module.css'
import { useSockets } from 'hooks/useSockets';

type PageProps = PropsWithServerCache<{
  room: ChatRoom
}>;

export default function Page({ cacheSnapshot }: PageProps) {
  useHydrateCache({
    cacheSnapshot,

    // If it should refetch everything after the component is mounted
    // By default 'shouldRefetch' is `false` (You can change it in the 'defaults' option)
    shouldRefetch: false,
  });

  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState(['Messages will show up here']);
  const query = useQuery();
  const router = useRouter();
  const socket = useSockets(router?.query.id as string);
  const windowEl = useRef(null);

  const room = query.chatRoom({ id: router?.query.id as string });

  const updateChat = (newMessage: string) => {
    const isScrolledToBottom = Math.abs(windowEl.current.scrollTop - (windowEl.current.scrollHeight - windowEl.current.offsetHeight)) < 30;
    setChatHistory((messages) => [...messages, newMessage]);
    if (isScrolledToBottom) {
      console.log('IS scrolled to bottom')
      setTimeout(() => {
        windowEl.current.scrollTop = windowEl.current.scrollHeight - windowEl.current.offsetHeight;
      }, 100);
    } else {
      console.log('NOT scrolled to bottom')
    }
  }

  const handleMessageSend = (event) => {
    event.preventDefault();
    socket.emit('say', message, router?.query.id);
    updateChat(message);
    setMessage('');
  }

  useEffect(() => {
    socket?.on('say', (incomingMessage) => {
      updateChat(incomingMessage);
    })
  }, [socket])

  return (
    <>

      <Head>
        <title>
          {room.roomName} - Chatlas!
        </title>
      </Head>

      <main>
        <h1>Now Chatting in "{room.roomName}"</h1>
        <div dangerouslySetInnerHTML={{ __html: room.roomDescription }}></div>
        <div className={styles.window} ref={windowEl}>
          {chatHistory.map(chatHistoryItem => {
            return (
              <div key={chatHistoryItem} className={styles.message}>{chatHistoryItem}</div>
            )
          })}
        </div>
        <form onSubmit={handleMessageSend}>
          <input type="text" value={message} onChange={event => setMessage(event.target.value)} className={styles.input} name="message" id="message" maxLength={255} />
          <button className={styles.button} type="submit">Send Message</button>
        </form>
      </main>
    </>
  );
}

export async function getStaticProps(context: GetStaticPropsContext) {
  const room: ChatRoom = null;

  const { cacheSnapshot } = await prepareReactRender(
    <Page room={room} />
  );

  return {
    props: {
      room,
      cacheSnapshot
    },
    revalidate: 1
  }
}

export async function getStaticPaths() {
  return {
    paths: ['/rooms/cG9zdDo2', '/rooms/cG9zdDo3'],
    fallback: true
  }
}
