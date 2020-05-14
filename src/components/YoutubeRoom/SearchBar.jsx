import React, { useState } from 'react';
import url from 'url';

import Box from '@material-ui/core/Box';
import SearchIcon from '@material-ui/icons/Search';
import TextField from '@material-ui/core/TextField';
import IconButton from '@material-ui/core/IconButton';

import { useAppState } from '../../state';
import { useYoutubeRoomState } from '../YoutubeRoomStateProvider';

export default function SearchBar() {
  const {
    roomId: { current: roomId },
  } = useAppState();
  const { client, player, playerReady } = useYoutubeRoomState();
  const [urlFieldValue, setUrlFieldValue] = useState('');

  const onSendVideo = url => {
    client.changeVideo(roomId, url);
  };

  const onSearch = () => {
    // Determine if pressed key is ENTER
    const { v } = url.parse(urlFieldValue, true).query;
    setUrlFieldValue('');
    if (v) {
      onSendVideo(v);
      //   player.current.loadVideoById(v);
      //   player.current.stopVideo();
      //   player.current.pauseVideo();
    }
  };

  return (
    <>
      <Box m={1}>
        <IconButton aria-label="search" component="span" onClick={onSearch} disabled={!playerReady}>
          <SearchIcon />
        </IconButton>
      </Box>
      <Box flexGrow={1} m={1}>
        <TextField
          disabled={!playerReady}
          variant="outlined"
          value={urlFieldValue}
          onKeyDown={e => (e.key === 'Enter' ? onSearch() : null)}
          onChange={e => setUrlFieldValue(e.target.value)}
          id="input-with-icon-grid"
          label="Youtube URL"
          fullWidth
        />
      </Box>
    </>
  );
}
