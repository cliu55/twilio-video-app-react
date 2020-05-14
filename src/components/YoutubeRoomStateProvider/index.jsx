import React, { createContext, useContext, useState, useRef } from 'react';
import socket from '../../socket';

export const YoutubeRoomContext = createContext(null);

export default function YoutubeRoomStateProvider(props) {
  let player = useRef(null);
  const [youtubeURL, setYoutubeURL] = useState('');
  const [playerReady, setPlayerReady] = useState(false);
  const [roomMaster, setRoomMaster] = useState({ memberId: '', userName: '' });
  const [client] = useState(() => socket());

  return (
    <YoutubeRoomContext.Provider
      value={{ player, playerReady, setPlayerReady, roomMaster, setRoomMaster, client, youtubeURL, setYoutubeURL }}
    >
      {props.children}
    </YoutubeRoomContext.Provider>
  );
}

export function useYoutubeRoomState() {
  const context = useContext(YoutubeRoomContext);
  if (!context) {
    throw new Error('useYoutubeRoomState must be used within the YoutubeRoomStateProvider');
  }
  return context;
}
