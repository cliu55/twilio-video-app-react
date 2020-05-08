import React, { Component } from 'react';
import styled from 'styled-components';

import Grid from '@material-ui/core/Grid';
import SearchIcon from '@material-ui/icons/Search';
import FlagIcon from '@material-ui/icons/Flag';
import PersonIcon from '@material-ui/icons/Person';
import Tooltip from '@material-ui/core/Tooltip';
import TextField from '@material-ui/core/TextField';
import Fab from '@material-ui/core/Fab';
import SendIcon from '@material-ui/icons/Send';
import Chip from '@material-ui/core/Chip';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import IconButton from '@material-ui/core/IconButton';

import url from 'url';

import socket from '../../socket';
import MembersDialog from './MembersDialog';
import { VideoContext } from '../../components/VideoProvider';
import AspectRatio from './AspectRatio/AspectRatio';

const ChatPanel = styled.div`
  position: relative;
  display: inline-flex;
  flex-direction: column;
  justify-content: flex-end;
  height: 100%;
  width: 100%;
  box-sizing: border-box;
  z-index: 1;
`;

const NoDots = styled.div`
  hr {
    visibility: hidden;
  }
`;

const InputPanel = styled.div`
  display: flex;
  align-items: center;
  padding: 20px;
  align-self: center;
  border-top: 1px solid #fafafa;
`;

const Scrollable = styled.div`
  max-height: 100vh;
  overflow: auto;
`;
export default class YoutubeVideo extends Component {
  incomingEventCount = 0;
  prevTime = 0;
  playerReady = false;
  constructor(props) {
    super(props);
    this.state = {
      client: socket(),
      urlFieldValue: '',
      messageFieldValue: '',
      chatHistory: [],
      isRoomMaster: false,
      members: [],
      roomMaster: {},
      dialogOpen: false,
      dialogSelectedValue: '',
    };

    this.onEnterChatroom = this.onEnterChatroom.bind(this);
    this.onInput = this.onInput.bind(this);
    this.onSendMessage = this.onSendMessage.bind(this);
    this.onSendVideo = this.onSendVideo.bind(this);
    this.onSendVideoState = this.onSendVideoState.bind(this);
    this.onSendVideoTime = this.onSendVideoTime.bind(this);

    this.onMessageReceived = this.onMessageReceived.bind(this);
    this.updateChatHistory = this.updateChatHistory.bind(this);
    this.onVideoUrlReceived = this.onVideoUrlReceived.bind(this);
    this.onVideoStateReceived = this.onVideoStateReceived.bind(this);
    this.onVideoTimeReceived = this.onVideoTimeReceived.bind(this);
    this.onMemberJoin = this.onMemberJoin.bind(this);
    this.onMemberLeave = this.onMemberLeave.bind(this);
    this.onRoomMasterChange = this.onRoomMasterChange.bind(this);

    this.loadVideo = this.loadVideo.bind(this);
    this.onPlayerReady = this.onPlayerReady.bind(this);
    this.onPlayerStateChange = this.onPlayerStateChange.bind(this);
    this.onVideoUrlChange = this.onVideoUrlChange.bind(this);
    this.onSearch = this.onSearch.bind(this);
    this.startInterval = this.startInterval.bind(this);
    this.handleChipClick = this.handleChipClick.bind(this);
    this.handleDialogClose = this.handleDialogClose.bind(this);
  }

  componentDidMount() {
    console.log('context', this.context);
    this.state.client.registerHandler('message', this.onMessageReceived);
    this.state.client.registerHandler('changeVideo', this.onVideoUrlReceived);
    this.state.client.registerHandler('changeVideoState', this.onVideoStateReceived);
    this.state.client.registerHandler('changeVideoTime', this.onVideoTimeReceived);
    this.state.client.registerHandler('join', this.onMemberJoin);
    this.state.client.registerHandler('leave', this.onMemberLeave);
    this.state.client.registerHandler('changeRoomMaster', this.onRoomMasterChange);
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
    this.onEnterChatroom(this.props.roomId, this.props.userName);
  }

  onEnterChatroom(chatroomName, userName) {
    this.state.client.register(userName);
    this.state.client.join(chatroomName, userName, ({ size, roomMaster, membersList }) => {
      if (size === 1) {
        this.setState({
          isRoomMaster: true,
        });
      }
      this.setState({
        members: membersList,
        roomMaster,
      });
    });
  }

  onInput(e) {
    this.setState({
      messageFieldValue: e.target.value,
    });
  }

  /*
    Methods related to broadcasting events through socket
  */
  onSendMessage() {
    if (this.state.messageFieldValue === '') return;
    const chatroomName = this.props.roomId;
    const message = this.state.messageFieldValue;
    this.state.client.message(chatroomName, message);
    this.setState({ messageFieldValue: '' });
  }

  onSendVideo(url) {
    const chatroomName = this.props.roomId;
    this.state.client.changeVideo(chatroomName, url);
  }

  onSendVideoState(state) {
    const chatroomName = this.props.roomId;
    this.state.client.changeVideoState(chatroomName, state);
  }

  onSendVideoTime(time) {
    const chatroomName = this.props.roomId;
    this.state.client.changeVideoTime(chatroomName, time);
  }

  onChangeRoomMaster(roomMaster) {
    this.setState({ isRoomMaster: false });

    const chatroomName = this.props.roomId;
    this.state.client.changeRoomMaster(chatroomName, roomMaster);
  }

  /*
    Methods related to receiving broadcasted events from socket
  */
  onMemberJoin(member) {
    this.setState({
      members: this.state.members.concat(member),
    });
  }

  onMemberLeave(membersList) {
    this.setState({
      members: membersList,
    });
  }

  onMessageReceived(entry) {
    this.updateChatHistory(entry);
  }

  updateChatHistory(entry) {
    this.setState({ chatHistory: this.state.chatHistory.concat(entry) });
  }

  onVideoUrlReceived(newUrl) {
    const currVideoUrl = this.player.getVideoUrl();
    if (!currVideoUrl || url.parse(currVideoUrl, true).query.v === newUrl) return;
    this.player.loadVideoById(newUrl);
    this.player.stopVideo();
  }

  onVideoStateReceived(state) {
    if (!this.playerReady || state === this.player.getPlayerState() || this.state.isRoomMaster) return;
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
        this.player.pauseVideo();
        break;
      default:
        break;
    }
  }

  onVideoTimeReceived(time) {
    if (this.state.isRoomMaster) return;
    if (this.playerReady && Math.round(Math.abs(this.player.getCurrentTime() - time)) > 1) {
      this.player.seekTo(time);
    }
  }

  onRoomMasterChange(roomMaster) {
    console.log('ROOM MASTER', roomMaster, this.state.roomMaster);
    if (roomMaster.userName === this.props.userName) {
      this.setState({
        isRoomMaster: true,
      });
    }
    this.setState({
      roomMaster,
    });
  }

  /*
    Methods related to Youtube Iframe API
  */
  loadVideo() {
    this.player = new window.YT.Player('player', {
      height: '100%',
      width: '100%',
      videoId: 'A7fZp9dwELo', //TODO: tempoary video, replace with something else
      events: {
        onReady: this.onPlayerReady,
        onStateChange: this.onPlayerStateChange,
      },
    });
  }

  onPlayerReady(event) {
    this.startInterval();
    this.playerReady = true;
    console.log('Player Ready');
  }

  startInterval() {
    setInterval(() => {
      if (this.state.isRoomMaster) {
        const currTime = this.player.getCurrentTime();
        this.onSendVideoTime(currTime);
        this.onSendVideoState(this.player.getPlayerState());
        this.prevTime = currTime;
      }
    }, 1000);
  }

  onPlayerStateChange(event) {
    if (!this.state.isRoomMaster) {
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

  onSearch() {
    // Determine if pressed key is ENTER
    const { v } = url.parse(this.state.urlFieldValue, true).query;
    if (v) {
      this.onSendVideo(v);
      this.player.loadVideoById(v);
      this.player.stopVideo();
    }
  }

  /*
    Methods related to room members role
  */
  handleChipClick() {
    this.setState({
      dialogOpen: true,
    });
  }

  handleDialogClose(value) {
    if (value) {
      this.onChangeRoomMaster(value);
    }
    this.setState({
      dialogOpen: false,
      dialogSelectedValue: value,
    });
  }

  render() {
    return (
      <Grid container item xs={10} spacing={1} alignContent="flex-start">
        <Grid container item xs={10} spacing={2} alignItems="center">
          <Grid item>
            <IconButton aria-label="search" component="span" onClick={this.onSearch}>
              <SearchIcon />
            </IconButton>
          </Grid>
          <Grid item xs={7}>
            <TextField
              variant="outlined"
              value={this.state.urlFieldValue}
              onKeyDown={e => (e.key === 'Enter' ? this.onSearch() : null)}
              onChange={this.onVideoUrlChange}
              id="input-with-icon-grid"
              label="Youtube URL"
              fullWidth
            />
          </Grid>
          <Grid itemType>
            <Tooltip title="Only Room Master have playback control">
              {this.state.isRoomMaster ? (
                <Chip icon={<FlagIcon />} label="Room Master" onClick={this.handleChipClick} />
              ) : (
                <Chip icon={<PersonIcon />} label="Participant" />
              )}
            </Tooltip>
          </Grid>
          <MembersDialog
            selectedValue={this.state.dialogSelectedValue}
            open={this.state.dialogOpen}
            onClose={this.handleDialogClose}
            members={this.state.members.filter(m => m.userName !== this.props.userName)}
          />
        </Grid>
        <Grid item xs={8}>
          <AspectRatio ratio={16 / 9}>
            <div id="player"></div>
          </AspectRatio>
        </Grid>
        <Grid item xs={4}>
          <ChatPanel>
            <Scrollable>
              <List>
                {this.state.chatHistory.map(({ user, message, event }, i) => {
                  return [
                    <NoDots>
                      <ListItem key={i} style={{ color: '#fafafa' }}>
                        <ListItemText
                          primary={`${user.name} ${event || ''}`}
                          secondary={
                            <React.Fragment>
                              <Typography component="span" variant="body2" color="textPrimary">
                                {message}
                              </Typography>
                            </React.Fragment>
                          }
                        />
                      </ListItem>
                    </NoDots>,
                    <Divider inset="true" />,
                  ];
                })}
              </List>
            </Scrollable>
            <InputPanel>
              <TextField
                textareastyle={{ color: '#fafafa' }}
                hintstyle={{ color: '#fafafa' }}
                floatinglabelstyle={{ color: '#fafafa' }}
                hinttext="Enter a message."
                floatinglabeltext="Enter a message."
                multiline
                rows={4}
                rowsMax={4}
                onChange={this.onInput}
                value={this.state.messageFieldValue}
                onKeyPress={e => (e.key === 'Enter' ? this.onSendMessage() : null)}
              />
              <Fab
                color="primary"
                aria-label="add"
                onClick={this.onSendMessage}
                size="small"
                style={{ marginLeft: 20 }}
              >
                <SendIcon style={{ fontSize: 18 }} className="material-icons" />
              </Fab>
            </InputPanel>
          </ChatPanel>
        </Grid>
      </Grid>
    );
  }
}

YoutubeVideo.contextType = VideoContext;
