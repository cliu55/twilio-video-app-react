import React, { useEffect, useRef } from 'react';
import url from 'url';

import Box from '@material-ui/core/Box';

import AspectRatio from '../AspectRatio/AspectRatio';
import { useAppState } from '../../state';
import { useYoutubeRoomState } from '../YoutubeRoomStateProvider';

export default function YoutubePlayer({ bRoomMaster }) {
  const {
    roomId: { current: roomId },
    user,
  } = useAppState();
  const { client, player, playerReady, setPlayerReady, roomMaster, youtubeURL, setYoutubeURL } = useYoutubeRoomState();
  const prevTime = useRef(0);
  const interval = useRef(null);
  const leaderPaused = useRef(false);

  // Need to rebind all listeners when context change because of listener scopes
  useEffect(() => {
    client.registerHandler('changeVideo', onVideoUrlReceived);
    client.registerHandler('changeVideoState', onVideoStateReceived);
    client.registerHandler('changeVideoTime', onVideoTimeReceived);

    return function cleanup() {
      client.unregisterHandler('changeVideo');
      client.unregisterHandler('changeVideoState');
      client.unregisterHandler('changeVideoTime');
    };
  }, [roomId, user, roomMaster, playerReady]);

  useEffect(() => {
    if (playerReady && isRoomMaster(roomMaster, user)) {
      interval.current = setInterval(() => {
        const currTime = player.current.getCurrentTime();
        onSendVideoTime(currTime);
        onSendVideoState(player.current.getPlayerState());
        prevTime.current = currTime;
      }, 1000);
    }
    return function cleanup() {
      clearInterval(interval.current);
    };
  }, [playerReady, roomMaster, user]);

  useEffect(() => {
    // On mount, check to see if the API script is already loaded
    if (!window.YT) {
      // If not, load the script asynchronously
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';

      // onYouTubeIframeAPIReady will load the video after the script is loaded
      window.onYouTubeIframeAPIReady = loadVideo;

      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
      // If script is already there, load the video directly
      loadVideo();
    }
  }, []);

  useEffect(() => {
    if (playerReady && youtubeURL) {
      // player.current.loadVideoById(youtubeURL);
      // player.current.stopVideo();
      player.current.cueVideoById(youtubeURL);
    }
  }, [youtubeURL, playerReady]);

  const isRoomMaster = (rm, usr) => rm.memberId && rm.memberId === usr.userId;

  const onSendVideoState = state => {
    client.changeVideoState(roomId, state);
  };

  const onSendVideoTime = time => {
    client.changeVideoTime(roomId, time);
  };

  const onVideoUrlReceived = newUrl => {
    if (!playerReady) return;
    setYoutubeURL(newUrl);
    // this is to prevent the situation where a user that pause video,
    // and someone in the room change the video and play, then when the
    // user unpause the video they
    // leaderPaused.current = false;
  };

  const onVideoStateReceived = state => {
    if (!playerReady || state === player.current.getPlayerState() || isRoomMaster(roomMaster, user)) return;
    const currState = player.current.getPlayerState();
    // if user's playback is paused or buffering and room master didn't initiate this state don't do anything
    if ((currState === 2 || currState === 3) && !leaderPaused.current) return;
    // only set leaderPaused to true if Room Master paused the
    leaderPaused.current = false;
    switch (state) {
      case -1: //unstarted
        player.current.stopVideo();
        break;
      case 0: //ended
        // TODO: queue next video
        break;
      case 1: //playing
        player.current.playVideo();
        break;
      case 2: //paused
        leaderPaused.current = true;
      case 3: //buffering
        player.current.pauseVideo();
        break;
      case 5: // video cued
        player.current.pauseVideo();
        break;
      default:
        break;
    }
  };

  const onVideoTimeReceived = time => {
    if (!playerReady || isRoomMaster(roomMaster, user)) return;
    const currState = player.current.getPlayerState();
    // if user's playback is paused or buffering and room master didn't initiate this state don't do anything
    if (currState === 2 && !leaderPaused.current) return;
    if (Math.round(Math.abs(player.current.getCurrentTime() - time)) > 1) {
      player.current.seekTo(time);
    }
  };

  /*
        Methods related to Youtube Iframe API
    */
  const loadVideo = () => {
    player.current = new window.YT.Player('player', {
      height: '100%',
      width: '100%',
      // videoId: currentVideoUrl.current || 'Ao2qQCqRSZs',
      videoId: youtubeURL || 'Ao2qQCqRSZs',
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    });
  };

  const onPlayerReady = event => {
    setPlayerReady(true);
    console.log('Player Ready');
  };

  const onPlayerStateChange = event => {
    //TODO: need to keep bRoomMaster here because of scope issue. onPlayerStateChange won't receive
    //updated values of contexts. Maybe fix by rebind on context update
    if (!bRoomMaster.current) {
      return;
    }
    // TODO: Create ENUM for player state
    switch (event.data) {
      case -1: //unstarted
        onSendVideoState(event.data);
        break;
      case 0: //ended
      case 1: //playing
      case 2: //paused
      case 3: //buffering
      case 5: // video cued
        onSendVideoState(event.data);
        break;
      default:
        break;
    }
  };

  return (
    <Box m={1}>
      <AspectRatio ratio={16 / 9}>
        <div id="player"></div>
      </AspectRatio>
    </Box>
  );
}
