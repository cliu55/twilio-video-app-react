import React, { useState, useEffect, useRef } from 'react';

import Box from '@material-ui/core/Box';
import FlagIcon from '@material-ui/icons/Flag';
import PersonIcon from '@material-ui/icons/Person';
import Tooltip from '@material-ui/core/Tooltip';
import Chip from '@material-ui/core/Chip';
import Typography from '@material-ui/core/Typography';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Switch from '@material-ui/core/Switch';

import MembersDialog from './MembersDialog';
import ChatWindow from './ChatWindow';
import SearchBar from './SearchBar';
import YoutubePlayer from './YoutubePlayer';
import MembersBar from './MembersBar';
import Playlist from './Playlist';

import { useAppState } from '../../state';
import { useYoutubeRoomState } from '../YoutubeRoomStateProvider';

import youtube from './youtube';

import { useParams } from 'react-router-dom';

export default function YoutubeRoom() {
  const { roomId, user, setUser } = useAppState();
  const { client, roomMaster, setRoomMaster, youtubeURL, setYoutubeURL, playlist, setPlaylist } = useYoutubeRoomState();

  const [members, setMembers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogSelectedValue, setDialogSelectedValue] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [autoplay, setAutoplay] = useState(false);

  const bRoomMaster = useRef(false);
  const autoplayChecked = useRef(false);
  const userPaused = useRef(false);

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
        const { title } = info;
        setVideoTitle(title || '');
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
      },
    } = items[0];
    return { title, thumbnail: url };
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

  const onChangePlaylist = id => {
    getVideoInfo(id).then(info => {
      client.changePlaylist(roomId.current, [...playlist, { id, ...info }]);
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

  return (
    <Box display="flex" width="85%" m={1}>
      <Box display="flex" flexDirection="column" width="75%" mr={1}>
        <Box display="flex" alignItems="center" m={1} pb={1} borderBottom={1}>
          <Box mx={1} mb={1} display="flex" alignItems="center">
            <Tooltip title="Only Room Master have playback control">
              {isRoomMaster(roomMaster, user) ? (
                <Chip icon={<FlagIcon />} label="Room Master" onClick={handleChipClick} />
              ) : (
                <Chip icon={<PersonIcon />} label="Participant" />
              )}
            </Tooltip>
            <Box ml={2}>
              <Typography variant="body1">
                Only Room Master can play video, skip time, toggle autoplay, and play/delete videos in playlist
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
        />
        <Box m={1}>
          <Typography variant="h4" component="h2">
            {videoTitle}
          </Typography>
        </Box>
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box width={3 / 4}>
            <SearchBar onSearchHandler={onChangePlaylist} searchText="Enter URL to add to playlist" />
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
