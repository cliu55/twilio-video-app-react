import React, { useState, useEffect, useRef } from 'react';

import Box from '@material-ui/core/Box';
import FlagIcon from '@material-ui/icons/Flag';
import PersonIcon from '@material-ui/icons/Person';
import Tooltip from '@material-ui/core/Tooltip';
import Chip from '@material-ui/core/Chip';

import MembersDialog from './MembersDialog';
import ChatWindow from './ChatWindow';
import SearchBar from './SearchBar';
import YoutubePlayer from './YoutubePlayer';

import { useAppState } from '../../state';
import { useYoutubeRoomState } from './YoutubeRoomStateProvider';

import { useParams } from 'react-router-dom';

export default function YoutubeRoom() {
  const { roomId, user, setUser } = useAppState();
  const { client, roomMaster, setRoomMaster, youtubeURL, setYoutubeURL } = useYoutubeRoomState();

  let bRoomMaster = useRef(false);

  const [members, setMembers] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogSelectedValue, setDialogSelectedValue] = useState('');

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

  const isRoomMaster = (rm, usr) => rm.memberId && rm.memberId === usr.userId;

  const onEnterRoom = () => {
    client.join(roomId.current, user.displayName, ({ clientId, size, roomMaster: rm, membersList, videoUrl }) => {
      if (size === 1) {
        bRoomMaster.current = true;
      }
      setUser(prev => {
        return { ...prev, userId: clientId };
      });
      setMembers(prev => [...prev, ...membersList]);
      setRoomMaster(rm);
      setYoutubeURL(videoUrl);
    });
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
          <MembersDialog
            selectedValue={dialogSelectedValue}
            open={dialogOpen}
            onClose={handleDialogClose}
            members={members.filter(m => m.memberId !== user.userId)}
          />
        </Box>
        <YoutubePlayer bRoomMaster={bRoomMaster} />
      </Box>
      <ChatWindow />
    </Box>
  );
}
