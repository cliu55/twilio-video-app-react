import React, { Component } from 'react';

import socket from '../../socket';

import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';
import url from 'url';

export default class YoutubeVideo extends Component {
  incomingEventCount = 0;
  prevTime = 0;
  constructor(props) {
    super(props);
    this.state = {
      client: socket(),
      urlFieldValue: '',
    };

    this.onSendMessage = this.onSendMessage.bind(this);
    this.onSendVideo = this.onSendVideo.bind(this);
    this.onSendVideoState = this.onSendVideoState.bind(this);
    this.onSendVideoTime = this.onSendVideoTime.bind(this);

    this.onMessageReceived = this.onMessageReceived.bind(this);
    this.onVideoUrlReceived = this.onVideoUrlReceived.bind(this);
    this.onVideoStateReceived = this.onVideoStateReceived.bind(this);
    this.onVideoTimeReceived = this.onVideoTimeReceived.bind(this);

    this.loadVideo = this.loadVideo.bind(this);
    this.onPlayerReady = this.onPlayerReady.bind(this);
    this.onPlayerStateChange = this.onPlayerStateChange.bind(this);
    this.onVideoUrlChange = this.onVideoUrlChange.bind(this);
    this.onSearch = this.onSearch.bind(this);
    this.startInterval = this.startInterval.bind(this);
  }

  componentDidMount() {
    this.state.client.registerHandler('message', this.onMessageReceived);
    this.state.client.registerHandler('changeVideo', this.onVideoUrlReceived);
    this.state.client.registerHandler('changeVideoState', this.onVideoStateReceived);
    this.state.client.registerHandler('changeVideoTime', this.onVideoTimeReceived);

    // On mount, check to see if the API script is already loaded
    if (!window.YT) {
      // If not, load the script asynchronously
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';

      // onYouTubeIframeAPIReady will load the video after the script is loaded
      window.onYouTubeIframeAPIReady = this.loadVideo;

      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    } else {
      // If script is already there, load the video directly
      this.loadVideo();
    }
  }

  onSendMessage(msg) {
    this.state.client.message(msg);
  }

  onSendVideo(url) {
    this.state.client.changeVideo(url);
  }

  onSendVideoState(state) {
    this.state.client.changeVideoState(state);
  }

  onSendVideoTime(time) {
    this.state.client.changeVideoTime(time);
  }

  onMessageReceived(msg) {}

  onVideoUrlReceived(url) {
    this.incomingEventCount++;
    this.player.loadVideoById(url);
    this.player.stopVideo();
  }

  onVideoStateReceived(state) {
    if (state === this.player.getPlayerState()) return;
    this.incomingEventCount++;
    switch (state) {
      case -1: //unstarted
        this.player.playVideo();
        break;
      case 0: //ended
        break;
      case 1: //playing
        this.player.playVideo();
        break;
      case 2: //paused
      case 3: //buffering
        this.player.pauseVideo();
        break;
      case 5: // video cued
        break;
      default:
        break;
    }
  }

  onVideoTimeReceived(time) {
    this.incomingEventCount++;
    this.player.seekTo(time);
  }

  // YOUTUBE IFRAME RELATED METHODS
  loadVideo() {
    this.player = new window.YT.Player('player', {
      height: '390',
      width: '640',
      videoId: 'A7fZp9dwELo', //TODO: tempoary video, replace with something else
      events: {
        onReady: this.onPlayerReady,
        onStateChange: this.onPlayerStateChange,
      },
    });
  }

  onPlayerReady(event) {
    // event.target.playVideo();
    this.startInterval();
  }

  onPlayerStateChange(event) {
    console.log('onPlayerStateChange: ', event.data);
    if (this.incomingEventCount) {
      this.incomingEventCount--;
      return;
    }

    // TODO: Create ENUM for player state
    switch (event.data) {
      case -1: //unstarted
        this.player.playVideo();
        this.onSendVideoState(event.data);
        break;
      case 0: //ended
      case 1: //playing
      case 2: //paused
      case 3: //buffering
      case 5: // video cued
        this.onSendVideoState(event.data);
        break;
      default:
        break;
    }
  }

  onVideoUrlChange(event) {
    this.setState({ urlFieldValue: event.target.value });
  }

  onSearch(event) {
    // Determine if pressed key is ENTER
    if (event.keyCode === 13) {
      const { v } = url.parse(this.state.urlFieldValue, true).query;
      this.onSendVideo(v);
      this.player.loadVideoById(v);
      this.player.stopVideo();
    }
  }

  startInterval() {
    setInterval(() => {
      const currTime = this.player.getCurrentTime();
      if (Math.round(Math.abs(this.prevTime - currTime)) > 1) {
        this.onSendVideoTime(currTime);
      }
      if (this.player.getPlayerState() === 1) {
        this.prevTime = currTime;
      }
    }, 1000);
  }

  render() {
    return (
      <Grid item xs={6}>
        <Grid container spacing={1} alignItems="flex-end">
          <Grid item>
            <SearchIcon />
          </Grid>
          <Grid item xs={10}>
            <TextField
              value={this.state.urlFieldValue}
              onKeyDown={this.onSearch}
              onChange={this.onVideoUrlChange}
              id="input-with-icon-grid"
              label="Paste URL Here"
              fullWidth
            />
          </Grid>
        </Grid>
        <div>
          <div>
            <div id="player"></div>
          </div>
        </div>
      </Grid>
    );
  }
}
