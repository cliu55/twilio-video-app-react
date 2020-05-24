import React, { useEffect, useRef } from 'react';

import Box from '@material-ui/core/Box';

import AspectRatio from '../AspectRatio/AspectRatio';
import { useAppState } from '../../state';
import { useYoutubeRoomState } from '../YoutubeRoomStateProvider';

export default function YoutubePlayer({ bRoomMaster, autoplay, onVideoEnd, userPaused }) {
  const { roomId, user } = useAppState();
  const {
    client,
    player,
    playerReady,
    setPlayerReady,
    roomMaster,
    youtubeURL,
    setYoutubeURL,
    playlist,
    setLoading,
  } = useYoutubeRoomState();
  const prevTime = useRef(0);
  const interval = useRef(null);
  const leaderPaused = useRef(false);
  // const userPaused = useRef(false);
  const currPlaylist = useRef([]);

  useEffect(() => {
    currPlaylist.current = playlist;
  }, [playlist]);

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
  }, [roomId.current, user, roomMaster, playerReady]);

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
      player.current.cueVideoById(youtubeURL);
    }
  }, [youtubeURL, playerReady]);

  const isRoomMaster = (rm, usr) => rm.memberId && rm.memberId === usr.userId;

  const onSendVideoState = state => {
    client.changeVideoState(roomId.current, state);
  };

  const onSendVideoTime = time => {
    client.changeVideoTime(roomId.current, time);
  };

  const onVideoUrlReceived = newUrl => {
    if (!playerReady) return;
    //This piece of junk code is to give the player to receive stop video state before loading new youtube URL
    //Otherwise it might trick logic into thinking user that paused
    //Ex: when a video is playing and someone load another video, or room master plays from playlist
    //The state change is 2 -> -1 > 5, this will trick logic into thinking user that paused
    //Because user's player will have to first pause(2) before loading new video
    setLoading(20);
    setTimeout(() => {
      setLoading(50);
    }, 1000);
    setTimeout(() => {
      setLoading(90);
    }, 2000);
    setTimeout(() => {
      setLoading(0);
      setYoutubeURL(newUrl);
    }, 3000);
    // this is to prevent the situation where a user that pause video,
    // and someone in the room change the video and play, then when the
    // user unpause the video they
    // leaderPaused.current = false;
  };

  const onVideoStateReceived = state => {
    if (!playerReady || state === player.current.getPlayerState() || isRoomMaster(roomMaster, user)) return;
    // if user's playback is paused and room master didn't initiate this state don't do anything
    if (userPaused.current) return;
    // only set leaderPaused to true if Room Master paused or loaded a video
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
      case 3: //buffering
        leaderPaused.current = true;
        player.current.pauseVideo();
        break;
      case 5: // video cued
        leaderPaused.current = true;
        player.current.pauseVideo();
        break;
      default:
        break;
    }
  };

  const onVideoTimeReceived = time => {
    if (!playerReady || isRoomMaster(roomMaster, user)) return;
    // if user paused playback don't do anything
    if (userPaused.current) return;
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
      videoId: youtubeURL || '-QJ4yDJSegs',
      events: {
        onReady: onPlayerReady,
        onStateChange: onPlayerStateChange,
      },
    });
  };

  const onPlayerReady = event => {
    setPlayerReady(true);
    console.log('Player Readys');
  };

  const onPlayerStateChange = event => {
    //room master didn't pause, user paused
    //Event sequence: onVideoStateReceived -> onPlayerStateChange
    //If room master paused, onVideoStateReceived would have captured that and set leaderpaused to true
    //So if room master didn't pause and current state is paused that means user initiated the pause
    if (!leaderPaused.current && event.data === 2) {
      userPaused.current = true;
    } //Video was paused by ususer and now pressed play
    //The play state can only comes from user because if userpaused is set true
    //onVideoStateReceived will reject all state coming from room master
    else if (userPaused.current && event.data === 1) {
      userPaused.current = false;
    }
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
        //If autoplay is not on, don't do anything
        if (autoplay.current && currPlaylist.current.length) {
          onVideoEnd(currPlaylist.current[0].id);
          client.changePlaylist(roomId.current, currPlaylist.current.slice(1));
        }
        break;
      case 1: //playing
      case 2: //paused
      case 3: //buffering
        onSendVideoState(event.data);
        break;
      case 5: // video cued
        if (autoplay.current) {
          player.current.playVideo();
        }
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
