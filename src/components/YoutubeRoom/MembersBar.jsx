import React, { useState, useEffect } from 'react';

import Box from '@material-ui/core/Box';
// import Tooltip from '@material-ui/core/Tooltip';
// import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
// import DialogTitle from '@material-ui/core/DialogTitle';
// import Dialog from '@material-ui/core/Dialog';
// import { TextField } from "@material-ui/core";
// import Button from '@material-ui/core/Button';
import Chip from '@material-ui/core/Chip';
// import IconButton from '@material-ui/core/IconButton';

import { useAppState } from '../../state';
import { useYoutubeRoomState } from '../YoutubeRoomStateProvider';
import { makeStyles } from '@material-ui/core/styles';

// const useStyles = makeStyles((theme) => ({
//   large: {
//     width: theme.spacing(7),
//     height: theme.spacing(7),
//   },
// }));

export default function MembersBar({ members, setMembers }) {
  // const classes = useStyles();
  const { roomId, user, setUser } = useAppState();
  const { client } = useYoutubeRoomState();

  // const [newName, setNewName] = useState("");
  // const [showEditDialog, setEditDialogState] = useState(false);

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
      <Box ml={1}>
        {/* <Tooltip title={m.userName}>
          <ListItemAvatar>
            <Avatar alt={m.userName} src={m.photoURL} />
          </ListItemAvatar>
        </Tooltip> */}
        <Chip avatar={<Avatar alt={m.userName} src={m.photoURL} />} label={m.userName} />
      </Box>
    ));
  };

  // const handleEditDialogClose = (e) => {
  //   setEditDialogState(false);
  //   setNewName('');
  // }

  // const saveUserName = (e) => {
  //   setUser({...user, displayName: newName});
  //   setEditDialogState(false);
  //   client.changeMemberInfo(roomId.current, {...user, displayName: newName});
  // }

  return (
    <Box display="flex" flexDirection="row" alignItems="center" height="10%" justifyContent="space-between">
      {/* <Dialog open={showEditDialog} onClose={handleEditDialogClose}>
          <DialogTitle id="simple-dialog-title">Edit Display Name</DialogTitle>
          <Box display="flex" flexDirection="column" alignItems="center">
            <Box m={2}>
              <TextField 
                value={newName} 
                placeholder={user.displayName}
                onChange={e => setNewName(e.target.value)}
              />
            </Box>
            <Box m={2}>
              <Button variant="contained" color="secondary" onClick={saveUserName}>
                Save changes
              </Button>
            </Box>
          </Box>
      </Dialog> */}
      <Box m={1} display="flex" flexDirection="row" overflow="auto" alignItems="center">
        {displayRoomMembers()}
      </Box>
      {/* <IconButton component="span" onClick={e => setEditDialogState(true)}>
        <Avatar alt={user.displayName} src={user.photoURL} className={classes.large}/>
      </IconButton> */}
    </Box>
  );
}
