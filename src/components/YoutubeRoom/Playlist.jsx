import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

import Box from '@material-ui/core/Box';
import IconButton from '@material-ui/core/IconButton';
import PlayArrowIcon from '@material-ui/icons/PlayArrow';
import DeleteIcon from '@material-ui/icons/Delete';

import { useAppState } from '../../state';
import { useYoutubeRoomState } from '../YoutubeRoomStateProvider';

const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
};

const VideoItem = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  border-bottom: 1px solid;
  align-items: center;
  margin: 2px;
`;

function Video({ video, index, handlePlay, handleDelete }) {
  const { user } = useAppState();
  const { roomMaster } = useYoutubeRoomState();

  const isRoomMaster = (rm, usr) => rm.memberId && rm.memberId === usr.userId;

  return (
    <Draggable draggableId={video.id} index={index}>
      {provided => (
        <VideoItem ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
          <Box m={1} display="flex" alignItems="center">
            <Box mr={1}>
              <h2>{index + 1}</h2>
            </Box>
            <img src={video.thumbnail} />
            <Box ml={1}>
              <h2>{video.title}</h2>
            </Box>
          </Box>
          {isRoomMaster(roomMaster, user) ? (
            <Box>
              <IconButton onClick={() => handlePlay(video.id)}>
                <PlayArrowIcon fontSize="large" />
              </IconButton>
              <IconButton onClick={() => handleDelete(video.id)}>
                <DeleteIcon fontSize="large" />
              </IconButton>
            </Box>
          ) : null}
        </VideoItem>
      )}
    </Draggable>
  );
}

const VideoList = React.memo(function VideoList({ videos, handlePlay, handleDelete }) {
  return videos.map((video, index) => (
    <Video video={video} index={index} key={video.id} handlePlay={handlePlay} handleDelete={handleDelete} />
  ));
});

export default function Playlist() {
  const { roomId } = useAppState();
  const { client, playlist, setPlaylist, player, playerReady } = useYoutubeRoomState();

  useEffect(() => {
    client.registerHandler('changePlaylist', onPlaylistChange);
    return function cleanup() {
      client.unregisterHandler('changePlaylist');
    };
  }, [client, playlist]);

  const onPlaylistChange = videos => {
    // console.log("comparing", videos, playlist, videos == playlist)
    // if(videos == playlist) {
    //   return;
    // }
    // console.log("onReceiveList", videos);
    // setState({ videos });

    setPlaylist(videos);
  };

  const handlePlay = id => {
    console.log(playerReady, 'readys');
    if (playerReady) {
      player.current.stopVideo();
    }

    // setTimeout(() => {
    console.log('play', id);
    handleDelete(id);
    client.changeVideo(roomId.current, id);
    // }, 5000);
  };

  const handleDelete = id => {
    console.log('delteEvent', id);
    const videos = playlist.filter(video => video.id !== id);
    setPlaylist(videos);
    client.changePlaylist(roomId.current, videos);
  };

  function onDragEnd(result) {
    if (!result.destination) {
      return;
    }

    if (result.destination.index === result.source.index) {
      return;
    }

    const videos = reorder(playlist, result.source.index, result.destination.index);

    console.log('reorder', videos);
    setPlaylist(videos);
    client.changePlaylist(roomId.current, videos);
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <Droppable droppableId="list">
        {provided => (
          <div ref={provided.innerRef} {...provided.droppableProps}>
            <VideoList videos={playlist} handlePlay={handlePlay} handleDelete={handleDelete} />
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
}
