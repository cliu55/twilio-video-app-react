import React from 'react';
import { styled, makeStyles } from '@material-ui/core/styles';
import Box from '@material-ui/core/Box';
import YoutubeRoom from './components/YoutubeRoom/YoutubeRoom';

import Toolbar from '@material-ui/core/Toolbar';
import Drawer from '@material-ui/core/Drawer';
import Controls from './components/Controls/Controls';
import MenuBar from './components/MenuBar/MenuBar';
import ReconnectingNotification from './components/ReconnectingNotification/ReconnectingNotification';
import Room from './components/Room/Room';
import YoutubeRoomStateProvider from './components/YoutubeRoomStateProvider';
import { useAppState } from './state';

import useHeight from './hooks/useHeight/useHeight';
import useRoomState from './hooks/useRoomState/useRoomState';

const Container = styled('div')({
  display: 'grid',
  gridTemplateRows: 'auto 1fr',
});

const Main = styled('main')({
  overflow: 'hidden',
  margin: '10px',
});

const useStyles = makeStyles(theme => ({
  drawer: {
    width: '15%',
    flexShrink: 0,
    overflow: 'auto',
  },
  drawerPaper: {
    width: '15%',
    backgroundColor: theme.palette.background.default,
  },
}));

export default function App() {
  const roomState = useRoomState();
  const classes = useStyles();
  const { drawerOpen } = useAppState();

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
          <Drawer
            className={classes.drawer}
            variant="persistent"
            anchor="left"
            open={drawerOpen}
            classes={{
              paper: classes.drawerPaper,
            }}
          >
            <Toolbar />
            <Main>
              {roomState === 'disconnected' ? null : <Room />}
              <Controls />
            </Main>
          </Drawer>
          <YoutubeRoom />
        </Box>
        <ReconnectingNotification />
      </YoutubeRoomStateProvider>
    </Container>
  );
}
