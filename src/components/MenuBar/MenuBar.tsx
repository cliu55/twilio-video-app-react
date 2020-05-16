import React, { MouseEvent, ChangeEvent, FormEvent, useState, useEffect } from 'react';
import { createStyles, makeStyles, Theme, fade } from '@material-ui/core/styles';

import Box from '@material-ui/core/Box';
import AppBar from '@material-ui/core/AppBar';
import LocalAudioLevelIndicator from './LocalAudioLevelIndicator/LocalAudioLevelIndicator';
import Button from '@material-ui/core/Button';
import CircularProgress from '@material-ui/core/CircularProgress';
import TextField from '@material-ui/core/TextField';
import LinearProgress from '@material-ui/core/LinearProgress';
import Tooltip from '@material-ui/core/Tooltip';
import LinkIcon from '@material-ui/icons/Link';
import IconButton from '@material-ui/core/IconButton';
import Toolbar from '@material-ui/core/Toolbar';
import VoiceChatIcon from '@material-ui/icons/VoiceChat';

import ToggleFullscreenButton from './ToggleFullScreenButton/ToggleFullScreenButton';
import Menu from './Menu/Menu';

import { useYoutubeRoomState } from '../YoutubeRoomStateProvider';
import UserProfile from '../YoutubeRoom/UserProfile';
import SearchBar from '../YoutubeRoom/SearchBar';

import { useAppState } from '../../state';
import { useParams } from 'react-router-dom';
import useRoomState from '../../hooks/useRoomState/useRoomState';
import useVideoContext from '../../hooks/useVideoContext/useVideoContext';
import { Typography } from '@material-ui/core';
import FlipCameraButton from './FlipCameraButton/FlipCameraButton';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    container: {
      backgroundColor: theme.palette.background.default,
      zIndex: theme.zIndex.drawer + 1,
    },
    toolbar: {
      [theme.breakpoints.down('xs')]: {
        padding: 0,
      },
    },
    form: {
      display: 'flex',
      flexWrap: 'wrap',
      alignItems: 'center',
      [theme.breakpoints.up('md')]: {
        marginLeft: '2.2em',
      },
    },
    normalWindow: {
      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
    },
    smallWindow: {
      [theme.breakpoints.up('md')]: {
        display: 'none',
      },
    },
    loadingSpinner: {
      marginLeft: '1em',
    },
    hide: {},
    displayName: {
      margin: '1.1em 0.6em',
      fontWeight: 600,
      [theme.breakpoints.down('sm')]: {
        display: 'none',
      },
    },
  })
);

export default function MenuBar() {
  const classes = useStyles();
  const { URLRoomName } = useParams();
  const { user, getToken, isFetching, roomId, setDrawerOpen } = useAppState();
  const { client, loading } = useYoutubeRoomState();
  const { isConnecting, connect } = useVideoContext();
  const roomState = useRoomState();

  const [name, setName] = useState<string>(user?.displayName || '');
  const [roomName, setRoomName] = useState<string>('');
  const [tooltipTitle, setTooltipTitle] = useState('Copy Room Link');

  useEffect(() => {
    if (URLRoomName) {
      setRoomName(URLRoomName);
    }
  }, [URLRoomName]);

  const handleSubmit = (event: MouseEvent<HTMLButtonElement>) => {
    if (setDrawerOpen) {
      setDrawerOpen(true);
    }
    event.preventDefault();
    // If this app is deployed as a twilio function, don't change the URL because routing isn't supported.
    if (!window.location.origin.includes('twil.io')) {
      window.history.replaceState(null, '', window.encodeURI(`/room/${roomId.current}${window.location.search || ''}`));
    }
    getToken(user?.displayName || '', roomId.current).then(token => connect(token));
  };

  const onSendVideo = (url: string) => {
    client.changeVideo(roomId.current, url);
  };

  const handleCopyLink = (e: MouseEvent<HTMLButtonElement>) => {
    const dummy = document.createElement('input');
    document.body.appendChild(dummy);
    dummy.value = window.location.href;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
    setTooltipTitle('Link Copied');
  };

  return (
    <AppBar className={classes.container} position="sticky">
      <LinearProgress variant="determinate" value={loading} />
      <Toolbar>
        <Box display="flex" justifyContent="flex-end" width="100%" alignItems="center">
          <Box width={1 / 4}>
            {roomState === 'disconnected' ? (
              <Box className={classes.form}>
                <Button
                  className={classes.normalWindow}
                  onClick={handleSubmit}
                  type="submit"
                  color="primary"
                  variant="contained"
                  disabled={isConnecting || !name || !roomName || isFetching}
                >
                  Enable Video Chat
                </Button>
                <IconButton className={classes.smallWindow} color="primary" onClick={handleSubmit}>
                  <VoiceChatIcon fontSize="large" />
                </IconButton>
                {(isConnecting || isFetching) && <CircularProgress className={classes.loadingSpinner} />}
              </Box>
            ) : (
              ''
            )}
          </Box>
          <Box width={2 / 4} display="flex" alignItems="center">
            <Box width="90%">
              <SearchBar onSearchHandler={onSendVideo} searchText={'Youtube URL'} search={true} />
            </Box>
            <Box>
              <Tooltip leaveDelay={1500} title={tooltipTitle} onClose={e => setTooltipTitle('Copy Room Link')}>
                <IconButton color="primary" onClick={handleCopyLink}>
                  <LinkIcon fontSize="large" />
                </IconButton>
              </Tooltip>
            </Box>
          </Box>

          <Box width={1 / 4} display="flex" alignItems="center" justifyContent="flex-end">
            <div className={classes.hide}>
              <Typography className={classes.displayName} variant="body1" align="right">
                {!user?.displayName ? '' : user.displayName}
              </Typography>
            </div>
            <UserProfile />
            <LocalAudioLevelIndicator />
            {/* <FlipCameraButton /> */}
            <ToggleFullscreenButton />
            {/* <Menu /> */}
          </Box>
        </Box>
      </Toolbar>
    </AppBar>
  );
}
