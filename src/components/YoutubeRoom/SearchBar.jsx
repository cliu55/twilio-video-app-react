import React, { useState } from 'react';
import url from 'url';
import { makeStyles, fade } from '@material-ui/core/styles';

import Box from '@material-ui/core/Box';
import SearchIcon from '@material-ui/icons/Search';
import AddIcon from '@material-ui/icons/Add';
import IconButton from '@material-ui/core/IconButton';
import InputBase from '@material-ui/core/InputBase';
import Snackbar from '@material-ui/core/Snackbar';
import CloseIcon from '@material-ui/icons/Close';

import { useYoutubeRoomState } from '../YoutubeRoomStateProvider';

const useStyles = makeStyles(theme => ({
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

  const { playerReady } = useYoutubeRoomState();
  const [urlFieldValue, setUrlFieldValue] = useState('');
  const [openSnackbar, setOpenSnackbar] = useState(false);

  const youtubePaser = url => {
    var regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regExp);
    return match && match[7].length == 11 ? match[7] : false;
  };

  const onSearch = () => {
    // Determine if pressed key is ENTER
    const v = youtubePaser(urlFieldValue);
    setUrlFieldValue('');
    if (v) {
      onSearchHandler(v);
    } else {
      setOpenSnackbar(true);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }

    setOpenSnackbar(false);
  };

  return (
    <Box>
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
        <Snackbar
          anchorOrigin={{
            vertical: 'bottom',
            horizontal: 'center',
          }}
          open={openSnackbar}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          message="Invalid URL"
          action={
            <React.Fragment>
              <IconButton size="small" aria-label="close" color="inherit" onClick={handleCloseSnackbar}>
                <CloseIcon fontSize="small" />
              </IconButton>
            </React.Fragment>
          }
        />
      </div>
    </Box>
  );
}
