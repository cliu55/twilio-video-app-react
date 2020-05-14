import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';

import Box from '@material-ui/core/Box';
import FlagIcon from '@material-ui/icons/Flag';
import PersonIcon from '@material-ui/icons/Person';
import Tooltip from '@material-ui/core/Tooltip';
import Chip from '@material-ui/core/Chip';
import Typography from '@material-ui/core/Typography';
import LinkIcon from '@material-ui/icons/Link';
import IconButton from '@material-ui/core/IconButton';

import MembersDialog from './MembersDialog';
import ChatWindow from './ChatWindow';
import SearchBar from './SearchBar';
import YoutubePlayer from './YoutubePlayer';
import MembersBar from './MembersBar';
import VideoQueue from './VideoQueue';

import { useAppState } from '../../state';
import { useYoutubeRoomState } from '../YoutubeRoomStateProvider';

import youtube from './youtube';

import { useParams } from 'react-router-dom';

export default function YoutubeRoom() {
  const { roomId, user, setUser } = useAppState();
  const { client, roomMaster, setRoomMaster, youtubeURL, setYoutubeURL } = useYoutubeRoomState();

  const bRoomMaster = useRef(false);

  const [members, setMembers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogSelectedValue, setDialogSelectedValue] = useState('');
  const [videoTitle, setVideoTitle] = useState('');
  const [tooltipTitle, setTooltipTitle] = useState('Copy Room Link');

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
      getVideoTitle().then(title => {
        setVideoTitle(title);
      });
    }
  }, [youtubeURL]);

  const getVideoTitle = async () => {
    const {
      data: { items },
    } = await youtube.get('/videos', {
      params: {
        id: youtubeURL,
      },
    });
    const {
      snippet: { title },
    } = items[0];
    console.log('title', title);
    return title || '';
  };

  const isRoomMaster = (rm, usr) => rm.memberId && rm.memberId === usr.userId;

  const onEnterRoom = () => {
    client.join(
      roomId.current,
      { displayName: user.displayName, photoURL: user.photoURL },
      ({ clientId, size, roomMaster: rm, membersList, videoUrl }) => {
        if (size === 1) {
          bRoomMaster.current = true;
        }
        setUser(prev => {
          return { ...prev, userId: clientId };
        });
        setMembers(prev => [...prev, ...membersList]);
        setRoomMaster(rm);
        setYoutubeURL(videoUrl);
      }
    );
  };

  /*
    Methods related to broadcasting events through socket
  */
  const onChangeRoomMaster = rm => {
    bRoomMaster.current = false;
    client.changeRoomMaster(roomId.current, rm);
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

  const handleCopyLink = e => {
    const dummy = document.createElement('input');
    document.body.appendChild(dummy);
    dummy.value = window.location.href;
    dummy.select();
    document.execCommand('copy');
    document.body.removeChild(dummy);
    setTooltipTitle('Link Copied');
  };

  // const displayRoomMembers = () => {
  //   let users = members.filter(m => m.memberId !== user.userId);
  //   return users.map((m, i) => [
  //     <Box>
  //       <Tooltip title={m.userName}>
  //         <ListItemAvatar>
  //           <Avatar alt={m.userName} src={m.photoURL} />
  //         </ListItemAvatar>
  //       </Tooltip>
  //     </Box>
  //   ]);
  // }

  // const editUserName = () => {

  // }

  return (
    <Box display="flex" width="80%" m={1}>
      <Box display="flex" flexDirection="column" width="70%" mr={1}>
        <Box display="flex" alignItems="center" m={1} pb={1} borderBottom={1}>
          <SearchBar />
          <Box m={1}>
            <Tooltip title="Only Room Master have playback control">
              {isRoomMaster(roomMaster, user) ? (
                <Chip icon={<FlagIcon />} label="Room Master" onClick={handleChipClick} />
              ) : (
                <Chip icon={<PersonIcon />} label="Participant" />
              )}
            </Tooltip>
          </Box>
          <Box>
            <Tooltip leaveDelay={1500} title={tooltipTitle} onClose={e => setTooltipTitle('Copy Room Link')}>
              <IconButton color="primary" onClick={handleCopyLink}>
                <LinkIcon fontSize="large" />
              </IconButton>
            </Tooltip>
          </Box>
          <MembersDialog
            selectedValue={dialogSelectedValue}
            open={dialogOpen}
            onClose={handleDialogClose}
            members={members.filter(m => m.memberId !== user.userId)}
          />
        </Box>
        <YoutubePlayer bRoomMaster={bRoomMaster} />
        <Box m={1}>
          <Typography variant="h4" component="h2">
            {videoTitle}
          </Typography>
        </Box>
        {/* <Box m={1}>
          <VideoQueue />
        </Box> */}
      </Box>
      <Box display="flex" flexDirection="column" width="30%">
        {/* <Box display="flex" flexDirection="row" alignItems="center" height="8%" justifyContent="space-between">
          <Box m={1} display="flex" flexDirection="row" overflow="auto" alignItems="center"> 
            {members.map((m, i) => [
              <Box>
                <Tooltip title={m.userName}>
                  <ListItemAvatar>
                    <Avatar alt={m.userName} src={m.photoURL} />
                  </ListItemAvatar>
                </Tooltip>
              </Box>
            ])}
            {displayRoomMembers()}
          </Box>
          <Box m={1} border={3} borderRadius="50%" onClick={editUserName}>
            <Avatar alt={user.displayName} src={user.photoURL}/>
          </Box>
        </Box> */}
        <MembersBar members={members} setMembers={setMembers} />
        <ChatWindow />
      </Box>
    </Box>
  );
}
