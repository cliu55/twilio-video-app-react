import React, { Component } from 'react';

import socket from '../../socket';

import Grid from '@material-ui/core/Grid';
import TextField from '@material-ui/core/TextField';
import SearchIcon from '@material-ui/icons/Search';
import url from 'url';

export default class YoutubeVideo extends Component {
  incomingMsgCount = 0;

  constructor(props) {
    super(props);
    this.state = {
      client: socket(),
      textFieldValue: '',
    };

    this.onSendMessage = this.onSendMessage.bind(this);
    this.onMessageReceived = this.onMessageReceived.bind(this);
    this.loadVideo = this.loadVideo.bind(this);
    this.onPlayerStateChange = this.onPlayerStateChange.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.search = this.search.bind(this);
  }

  componentDidMount() {
    this.state.client.registerHandler(this.onMessageReceived);

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

  onMessageReceived(entry) {
    if (entry === this.player.getPlayerState()) return;
    this.incomingMsgCount++;
    switch (entry) {
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
        this.player.loadVideoById(entry);
        this.player.stopVideo();
        break;
    }
  }

  // YOUTUBE RELATED
  // player.seekTo(seconds:Number, allowSeekAhead:Boolean)
  // player.getCurrentTime():Number
  loadVideo() {
    // the Player object is created uniquely based on the id in props
    this.player = new window.YT.Player('player', {
      height: '390',
      width: '640',
      videoId: 'Ojcub8txAUE', //TODO: replace with something else
      events: {
        onReady: this.onPlayerReady,
        onStateChange: this.onPlayerStateChange,
      },
    });
  }

  onPlayerReady(event) {
    // event.target.playVideo();
  }

  onPlayerStateChange(event) {
    if (this.incomingMsgCount) {
      this.incomingMsgCount--;
      return;
    }
    switch (event.data) {
      case -1: //unstarted
        this.player.playVideo();
      case 0: //ended
      case 1: //playing
      case 2: //paused
      case 3: //buffering
      case 5: // video cued
        this.onSendMessage(event.data);
        break;
      default:
        break;
    }
  }

  handleChange(event) {
    this.setState({ textFieldValue: event.target.value });
  }

  search(event) {
    if (event.keyCode === 13) {
      const { v } = url.parse(this.state.textFieldValue, true).query;
      this.onSendMessage(v);
      this.player.loadVideoById(v);
      this.player.stopVideo();
    }
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
              value={this.state.textFieldValue}
              onKeyDown={this.search}
              onChange={this.handleChange}
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
