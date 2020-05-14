import React from 'react';
import { styled } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import YoutubeRoom from './components/YoutubeRoom/YoutubeRoom';

import Controls from './components/Controls/Controls';
import LocalVideoPreview from './components/LocalVideoPreview/LocalVideoPreview';
import MenuBar from './components/MenuBar/MenuBar';
import ReconnectingNotification from './components/ReconnectingNotification/ReconnectingNotification';
import Room from './components/Room/Room';
import useVideoContext from './hooks/useVideoContext/useVideoContext';
import YoutubeRoomStateProvider from './components/YoutubeRoomStateProvider';

import useHeight from './hooks/useHeight/useHeight';
import useRoomState from './hooks/useRoomState/useRoomState';

const Container = styled('div')({
  display: 'grid',
  gridTemplateRows: 'auto 1fr',
});

const Main = styled('main')({
  overflow: 'hidden',
});

export default function App() {
  // local participant: { identity, sid }
  const {
    room: { name, localParticipant },
  } = useVideoContext();
  let identity = null;
  if (localParticipant) {
    identity = localParticipant.identity;
  }
  const roomState = useRoomState();
  console.log('ROOM NAME: ', name);
  console.log('Participant: ', localParticipant);

  // Here we would like the height of the main container to be the height of the viewport.
  // On some mobile browsers, 'height: 100vh' sets the height equal to that of the screen,
  // not the viewport. This looks bad when the mobile browsers location bar is open.
  // We will dynamically set the height with 'window.innerHeight', which means that this
  // will look good on mobile browsers even after the location bar opens or closes.
  const height = useHeight();

  return (
    <Container style={{ height }}>
      <YoutubeRoomStateProvider>
        <MenuBar />
        <Box display="flex">
          <Box width="20%" m={1}>
            <Main>
              {roomState === 'disconnected' ? <LocalVideoPreview /> : <Room />}
              <Controls />
            </Main>
          </Box>
          {/* {name ? <YoutubeRoom roomId ={name} userName ={identity}/> : null} */}
          <YoutubeRoom />
        </Box>
        <ReconnectingNotification />
      </YoutubeRoomStateProvider>
    </Container>
  );
}
