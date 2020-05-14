import React from 'react';
import PropTypes from 'prop-types';
import Avatar from '@material-ui/core/Avatar';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import DialogTitle from '@material-ui/core/DialogTitle';
import Dialog from '@material-ui/core/Dialog';
import PersonIcon from '@material-ui/icons/Person';

export default function MembersDialog(props) {
  const { onClose, selectedValue, open, members } = props;

  const handleClose = () => {
    onClose(selectedValue);
  };

  const handleListItemClick = value => {
    onClose(value);
  };

  return (
    <Dialog onClose={handleClose} aria-labelledby="simple-dialog-title" open={open}>
      <DialogTitle id="simple-dialog-title">Select New Room Master</DialogTitle>
      <List>
        {members.map(member => (
          <ListItem button onClick={() => handleListItemClick(member)} key={member.memberId}>
            <ListItemAvatar>
              <Avatar src={member.photoURL} />
              {/* <Avatar>
                <PersonIcon />
              </Avatar> */}
            </ListItemAvatar>
            <ListItemText primary={member.userName} />
          </ListItem>
        ))}
      </List>
    </Dialog>
  );
}

MembersDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  open: PropTypes.bool.isRequired,
  selectedValue: PropTypes.string.isRequired,
};
