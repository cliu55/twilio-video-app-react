import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { Waypoint } from 'react-waypoint';

import { GiphyFetch } from '@giphy/js-fetch-api';

import Dialog from '@material-ui/core/Dialog';
import GifIcon from '@material-ui/icons/Gif';
import GridList from '@material-ui/core/GridList';
import GridListTile from '@material-ui/core/GridListTile';
import { TextField } from '@material-ui/core';

require('dotenv').config();

const GifButton = styled.span`
  cursor: pointer;
  padding: 5px;
`;

const giphyFetch = new GiphyFetch(process.env.REACT_APP_GIPHY_API_KEY);

export default function GIFinput({ onSelection }) {
  const [showPicker, setPickerState] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [gifs, setGifs] = useState([]);
  const [showGif, setShowGif] = useState(false);
  const [gifURL, setGifURL] = useState('');
  const picker = useRef(null);
  const pagination = useRef(0);
  const gridlist = useRef(null);

  useEffect(() => {
    pagination.current = 0;
    fetchGifs();
    if (gridlist.current) {
      scrollToTop();
    }
  }, [searchTerm]);

  const fetchGifs = async (offset = 0) => {
    let data = [];
    if (searchTerm) {
      data = await giphyFetch.search(searchTerm, { offset, sort: 'relevant', limit: 10 });
    } else {
      data = await giphyFetch.trending({ offset, limit: 10 });
    }
    if (offset) {
      setGifs(prev => [...prev, ...data.data]);
    } else {
      setGifs(data.data);
    }
  };

  const togglePicker = () => {
    setPickerState(!showPicker);
    setSearchTerm('');
    fetchGifs();
  };

  const onGifClick = async e => {
    onSelection(e.target.src);
    togglePicker();
    setShowGif(false);
  };

  const loadMoreGifs = () => {
    if (gifs.length >= 100) return;
    pagination.current += 10;
    fetchGifs(pagination.current);
  };

  const scrollToTop = () => {
    gridlist.current.scrollTop = 0;
  };

  const onGifRightClick = e => {
    e.preventDefault();
    setShowGif(true);
    setGifURL(e.target.src);
  };

  return (
    <div ref={picker}>
      <Dialog open={showPicker} onClose={e => setPickerState(false)}>
        <Dialog open={showGif} onClose={e => setShowGif(false)}>
          <img src={gifURL} onClick={onGifClick} alt={''} />
        </Dialog>
        <TextField
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          variant="outlined"
          label="Search GIFS"
        />
        <GridList cols={2} cellHeight={260} ref={gridlist}>
          {gifs.map((gif, i) => (
            <GridListTile key={i} onClick={onGifClick} onContextMenu={onGifRightClick}>
              <img src={gif.images.downsized.url} alt={gif.title} />
            </GridListTile>
          ))}
          <Waypoint onEnter={loadMoreGifs}></Waypoint>
        </GridList>
      </Dialog>
      <GifButton onClick={togglePicker}>
        <GifIcon style={{ fontSize: 35 }} />
      </GifButton>
    </div>
  );
}
