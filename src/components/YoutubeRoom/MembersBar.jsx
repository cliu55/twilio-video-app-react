import React, { useEffect } from 'react';

import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';
import Chip from '@material-ui/core/Chip';

import { useAppState } from '../../state';
import { useYoutubeRoomState } from '../YoutubeRoomStateProvider';

export default function MembersBar({ members, setMembers }) {
  const { user } = useAppState();
  const { client } = useYoutubeRoomState();

  useEffect(() => {
    client.registerHandler('changeMemberInfo', onMemberInfoChange);
    return function cleanup() {
      client.unregisterHandler('changeMemberInfo');
    };
  }, [client, user]);

  const onMemberInfoChange = member => {
    setMembers(prev => prev.filter(m => m.memberId !== member.memberId).concat(member));
  };

  const displayRoomMembers = () => {
    let users = members.filter(m => m.memberId !== user.userId);
    return users.map((m, i) => (
      <Box ml={1} key={i}>
        <Chip avatar={<Avatar alt={m.userName} src={m.photoURL} />} label={m.userName} />
      </Box>
    ));
  };

  return (
    <Box mt={2} mb={1} display="flex" flexDirection="row" overflow="auto" alignItems="center">
      {displayRoomMembers()}
    </Box>
  );
}
