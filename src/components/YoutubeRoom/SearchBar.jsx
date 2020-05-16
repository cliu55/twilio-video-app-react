import React, { useState } from 'react';
import url from 'url';
import { makeStyles, fade } from '@material-ui/core/styles';

import Paper from '@material-ui/core/Paper';
import Box from '@material-ui/core/Box';
import SearchIcon from '@material-ui/icons/Search';
import AddIcon from '@material-ui/icons/Add';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';
import InputBase from '@material-ui/core/InputBase';

import { useAppState } from '../../state';
import { useYoutubeRoomState } from '../YoutubeRoomStateProvider';

const useStyles = makeStyles(theme => ({
  root: {
    padding: '2px 4px',
    marginRight: theme.spacing(1),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  search: {
    borderRadius: theme.shape.borderRadius,
    backgroundColor: fade(theme.palette.common.white, 0.15),
    '&:hover': {
      backgroundColor: fade(theme.palette.common.white, 0.25),
    },
    marginLeft: 0,
    [theme.breakpoints.up('sm')]: {
      marginLeft: theme.spacing(1),
      width: 'auto',
    },
  },
  input: {
    marginLeft: theme.spacing(1),
    flex: 1,
    width: '90%',
  },
  iconButton: {
    padding: 10,
  },
}));

export default function SearchBar({ onSearchHandler, searchText, search = false }) {
  const classes = useStyles();

  const {
    roomId: { current: roomId },
  } = useAppState();
  const { client, playerReady } = useYoutubeRoomState();
  const [urlFieldValue, setUrlFieldValue] = useState('');

  // const onSendVideo = url => {
  //   client.changeVideo(roomId, url);
  // };

  const onSearch = () => {
    // Determine if pressed key is ENTER
    const { v } = url.parse(urlFieldValue, true).query;
    setUrlFieldValue('');
    if (v) {
      // onSendVideo(v);
      onSearchHandler(v);
    }
  };

  return (
    <Box classname={classes.root}>
      <div className={classes.search}>
        <IconButton
          aria-label="search"
          type="submit"
          className={classes.iconButton}
          onClick={onSearch}
          disabled={!playerReady}
        >
          {search ? <SearchIcon /> : <AddIcon fontSize="large" />}
        </IconButton>
        <InputBase
          className={classes.input}
          disabled={!playerReady}
          value={urlFieldValue}
          onKeyDown={e => (e.key === 'Enter' ? onSearch() : null)}
          onChange={e => setUrlFieldValue(e.target.value)}
          placeholder={searchText}
          inputProps={{ 'aria-label': 'search input' }}
        />
      </div>
    </Box>
  );
}
