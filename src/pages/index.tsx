import { GetStaticPropsContext } from 'next';
import Head from 'next/head';
import React from 'react';
import { ChatRoom, prepareReactRender, useHydrateCache, useQuery } from 'client';
import { PropsWithServerCache } from '@gqless/react';
import { useRouter } from 'next/router';

type PageProps = PropsWithServerCache<{
  rooms: Array<ChatRoom>
}>;

export default function Page({ cacheSnapshot }: PageProps) {
  useHydrateCache({
    cacheSnapshot,

    // If it should refetch everything after the component is mounted
    // By default 'shouldRefetch' is `false` (You can change it in the 'defaults' option)
    shouldRefetch: false,
  });

  const query = useQuery();
  const router = useRouter();

  const handleEnterRoom = (pathId: string) => () => {
    router.push(`/rooms/${pathId}`)
  }

  return (
    <>

      <Head>
        <title>
          Chatlas!
        </title>
      </Head>

      <main>
        <h1>Choose your room</h1>
        {query.chatRooms().nodes.map(room => {
          return (
            <section key={room.id}>
              <header>
                <h2>{ room.roomName }</h2>
                <button type="button" onClick={handleEnterRoom(room.id)}>Enter Room</button>
              </header>
              <div dangerouslySetInnerHTML={{__html: room.roomDescription}}></div>
            </section>
          )
        })}
      </main>
    </>
  );
}

export async function getStaticProps(context: GetStaticPropsContext) {
  const rooms: ChatRoom[] = [];

  const { cacheSnapshot } = await prepareReactRender(
    <Page rooms={rooms} />
  );

  return {
    props: {
      rooms
    },
    revalidate: 1
  }
}
