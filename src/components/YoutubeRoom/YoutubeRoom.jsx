import React, { useState, useEffect, useRef } from 'react';

import Box from '@material-ui/core/Box';
import FlagIcon from '@material-ui/icons/Flag';
import PersonIcon from '@material-ui/icons/Person';
import Tooltip from '@material-ui/core/Tooltip';
import Chip from '@material-ui/core/Chip';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';
import Snackbar from '@material-ui/core/Snackbar';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';

import MembersDialog from './MembersDialog';
import ChatWindow from './ChatWindow';
import SearchBar from './SearchBar';
import YoutubePlayer from './YoutubePlayer';
import MembersBar from './MembersBar';
import Playlist from './Playlist';

import moment from 'moment';

import { useAppState } from '../../state';
import { useYoutubeRoomState } from '../YoutubeRoomStateProvider';

import { formatNumber } from '../../state/utils';

import youtube from './youtube';

import { useParams } from 'react-router-dom';

export default function YoutubeRoom() {
  const { roomId, user, setUser } = useAppState();
  const { client, roomMaster, setRoomMaster, youtubeURL, setYoutubeURL, playlist, setPlaylist } = useYoutubeRoomState();

  const [members, setMembers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogSelectedValue, setDialogSelectedValue] = useState({});
  const [videoInfo, setVideoInfo] = useState({});
  const [autoplay, setAutoplay] = useState(false);
  const [chipColor, setChipColor] = useState('primary');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const bRoomMaster = useRef(false);
  const autoplayChecked = useRef(false);
  const userPaused = useRef(false);
  const livePressed = useRef(true);

  const { URLRoomName } = useParams();

  useEffect(() => {
    if (URLRoomName) roomId.current = URLRoomName;
    onEnterRoom();
  }, [URLRoomName]);

  useEffect(() => {
    window.history.replaceState(null, '', window.encodeURI(`/room/${roomId.current}`));
    client.registerHandler('join', onMemberJoin);
    client.registerHandler('leave', onMemberLeave);
    return function cleanup() {
      client.unregisterHandler('join');
      client.unregisterHandler('leave');
    };
  }, [client, roomId]);

  useEffect(() => {
    if (user.userId) {
      client.registerHandler('changeRoomMaster', onRoomMasterChange);
    }
    return function cleanup() {
      client.unregisterHandler('changeRoomMaster');
    };
  }, [client, user]);

  useEffect(() => {
    if (youtubeURL) {
      getVideoInfo(youtubeURL).then(info => {
        setVideoInfo(info || {});
      });
    }
  }, [youtubeURL]);

  const getVideoInfo = async videoUrl => {
    const {
      data: { items },
    } = await youtube.get('/videos', {
      params: {
        id: videoUrl,
      },
    });
    const {
      snippet: {
        title,
        thumbnails: {
          default: { url },
        },
        channelTitle,
        description,
        publishedAt,
      },
      statistics: { viewCount, likeCount, dislikeCount },
    } = items[0];
    return {
      title,
      thumbnail: url,
      channelTitle,
      description,
      publishedAt,
      viewCount,
      likeCount,
      dislikeCount,
    };
  };

  const isRoomMaster = (rm, usr) => rm.memberId && rm.memberId === usr.userId;

  const onEnterRoom = () => {
    client.join(
      roomId.current,
      { displayName: user.displayName, photoURL: user.photoURL },
      ({ clientId, size, roomMaster: rm, membersList, videoUrl, playlist: list }) => {
        if (size === 1) {
          bRoomMaster.current = true;
        }
        setUser(prev => {
          return { ...prev, userId: clientId };
        });
        setMembers(prev => [...prev, ...membersList]);
        setRoomMaster(rm);
        setYoutubeURL(videoUrl);
        setPlaylist(list);
      }
    );
  };

  /*
    Methods related to broadcasting events through socket
  */
  const onChangeRoomMaster = rm => {
    bRoomMaster.current = false;
    userPaused.current = false;
    client.changeRoomMaster(roomId.current, rm);
  };

  const onSendVideo = url => {
    client.changeVideo(roomId.current, url);
  };

  const onChangePlaylist = videoId => {
    if (playlist.some(({ id }) => videoId === id)) {
      setOpenSnackbar(true);
      return;
    }
    getVideoInfo(videoId).then(info => {
      client.changePlaylist(roomId.current, [...playlist, { id: videoId, ...info }]);
    });
  };

  /*
    Methods related to receiving broadcasted events from socket
  */
  const onMemberJoin = member => {
    setMembers(prev => prev.concat(member));
  };

  const onMemberLeave = membersList => {
    setMembers(membersList);
  };

  const onRoomMasterChange = rm => {
    if (rm.memberId === user.userId) {
      bRoomMaster.current = true;
    }
    setRoomMaster(rm);
  };

  /*
    Methods related to room members role
  */
  const handleChipClick = () => {
    setDialogOpen(true);
  };

  const handleDialogClose = value => {
    if (value) {
      onChangeRoomMaster(value);
    }
    setDialogOpen(false);
    setDialogSelectedValue(value);
  };

  const handleLiveClick = () => {
    setChipColor('primary');
    livePressed.current = true;
    client.goLive(roomId.current, user.userId);
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenSnackbar(false);
  };

  return (
    <Box display="flex" width="85%" m={1}>
      <Box display="flex" flexDirection="column" width="75%" mr={1}>
        <Box display="flex" alignItems="center" m={1} pb={1} borderBottom={1}>
          <Box mx={1} mb={1} display="flex" alignItems="center">
            {!isRoomMaster(roomMaster, user) ? (
              <Box mr={1}>
                <Chip color={chipColor} label="LIVE" onClick={handleLiveClick} />
              </Box>
            ) : null}
            <Tooltip title="Only Room Master have playback control">
              {isRoomMaster(roomMaster, user) ? (
                <Chip icon={<FlagIcon />} label="Room Master" onClick={handleChipClick} />
              ) : (
                <Chip icon={<PersonIcon />} label="Participant" />
              )}
            </Tooltip>
            <Box ml={2} display="flex" flexDirection="column">
              <Typography variant="body1">
                Only Room Master can toggle autoplay and play/delete videos in playlist.
              </Typography>
              <Typography variant="body1">
                {!isRoomMaster(roomMaster, user) ? 'Press LIVE to re-sync video when out of sync' : ''}
              </Typography>
            </Box>
          </Box>
          <MembersDialog
            selectedValue={dialogSelectedValue}
            open={dialogOpen}
            onClose={handleDialogClose}
            members={members.filter(m => m.memberId !== user.userId)}
          />
        </Box>
        <YoutubePlayer
          bRoomMaster={bRoomMaster}
          autoplay={autoplayChecked}
          onVideoEnd={onSendVideo}
          userPaused={userPaused}
          setChipColor={setChipColor}
          livePressed={livePressed}
        />
        <Box m={1} display="flex" flexDirection="column">
          <Box>
            <Typography variant="h4" component="h2">
              {videoInfo.title}
            </Typography>
          </Box>
          <Box py={2} borderBottom={1}>
            <Typography variant="body1" color="textSecondary">
              {videoInfo.viewCount ? formatNumber(videoInfo.viewCount) + 'views •' : ''}{' '}
              {videoInfo.publishedAt ? moment(videoInfo.publishedAt).format('MMMM Do, YYYY') : ''}
            </Typography>
          </Box>
        </Box>
        <Box display="flex" alignItems="center" justifyContent="space-between" mt={2}>
          <Box width={3 / 4}>
            <SearchBar onSearchHandler={onChangePlaylist} searchText="Enter URL to add to playlist" />
            <Snackbar
              anchorOrigin={{
                vertical: 'bottom',
                horizontal: 'center',
              }}
              open={openSnackbar}
              autoHideDuration={6000}
              onClose={handleCloseSnackbar}
              message="This video is already in playlist"
              action={
                <React.Fragment>
                  <IconButton size="small" aria-label="close" color="inherit" onClick={handleCloseSnackbar}>
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </React.Fragment>
              }
            />
          </Box>
          <Box width={1 / 4} display="flex" alignItems="center" justifyContent="flex-end">
            <FormControlLabel
              control={
                <Switch
                  checked={autoplay}
                  onChange={e => {
                    setAutoplay(e.target.checked);
                    autoplayChecked.current = e.target.checked;
                  }}
                  name="checkedA"
                  disabled={!bRoomMaster.current}
                />
              }
              label="Autoplay"
            />
          </Box>
        </Box>
        <Box m={1}>
          <Playlist />
        </Box>
      </Box>
      <Box display="flex" flexDirection="column" width="25%" justifyContent="space-between" maxHeight="82vh">
        <MembersBar members={members} setMembers={setMembers} />
        <ChatWindow />
      </Box>
    </Box>
  );
}
