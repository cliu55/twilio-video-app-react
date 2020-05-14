import React, { useState } from 'react';

import Box from '@material-ui/core/Box';
import Avatar from '@material-ui/core/Avatar';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import { TextField } from '@material-ui/core';
import Button from '@material-ui/core/Button';
import IconButton from '@material-ui/core/IconButton';

import { useAppState } from '../../state';
import { useYoutubeRoomState } from '../YoutubeRoomStateProvider';
import { makeStyles } from '@material-ui/core/styles';

const useStyles = makeStyles(theme => ({
  large: {
    width: theme.spacing(7),
    height: theme.spacing(7),
  },
}));

export default function UserProfile() {
  const classes = useStyles();
  const { roomId, user, setUser } = useAppState();
  const { client } = useYoutubeRoomState();

  const [newName, setNewName] = useState('');
  const [showEditDialog, setEditDialogState] = useState(false);

  const handleEditDialogClose = e => {
    setEditDialogState(false);
    setNewName('');
  };

  const saveUserName = e => {
    setUser({ ...user, displayName: newName });
    setEditDialogState(false);
    client.changeMemberInfo(roomId.current, { ...user, displayName: newName });
  };

  return (
    <>
      <Dialog open={showEditDialog} onClose={handleEditDialogClose}>
        <DialogTitle id="simple-dialog-title">Edit Display Name</DialogTitle>
        <Box display="flex" flexDirection="column" alignItems="center">
          <Box m={2}>
            <TextField value={newName} placeholder={user.displayName} onChange={e => setNewName(e.target.value)} />
          </Box>
          <Box m={2}>
            <Button variant="contained" color="secondary" onClick={saveUserName}>
              Save changes
            </Button>
          </Box>
        </Box>
      </Dialog>
      <IconButton component="span" onClick={e => setEditDialogState(true)}>
        <Avatar alt={user.displayName} src={user.photoURL} className={classes.large} />
      </IconButton>
    </>
  );
}
