const io = require('socket.io-client');

export default function() {
  // const socket = io('/', {path: '/socket/', transports: ['websocket', 'polling', 'flashsocket']});
  const socket = io.connect(process.env.REACT_APP_SOCKET_ENDPOINT, { transports: ['websocket'], upgrade: false });
  // const socket = io.connect(process.env.REACT_APP_SOCKET_ENDPOINT);

  function registerHandler(eventName, onDataReceived) {
    socket.on(eventName, onDataReceived);
  }

  function unregisterHandler(eventName) {
    socket.off(eventName);
  }

  function message(chatroomName, message, type) {
    socket.emit('message', { chatroomName, message, type });
  }

  function changeVideo(chatroomName, url) {
    socket.emit('changeVideo', { chatroomName, url });
  }

  function changeVideoState(chatroomName, state) {
    socket.emit('changeVideoState', { chatroomName, state });
  }

  function changeVideoTime(chatroomName, time) {
    socket.emit('changeVideoTime', { chatroomName, time });
  }

  function changeRoomMaster(chatroomName, roomMaster) {
    socket.emit('changeRoomMaster', { chatroomName, roomMaster });
  }

  function changeMemberInfo(chatroomName, user) {
    socket.emit('changeMemberInfo', { chatroomName, user });
  }

  function changePlaylist(chatroomName, list) {
    socket.emit('changePlaylist', { chatroomName, list });
  }

  function goLive(chatroomName, userId) {
    socket.emit('goLive', { chatroomName, userId });
  }

  function sendLiveData(state, time, userId) {
    socket.emit('sendLiveData', { state, time, userId });
  }

  function join(chatroomName, user, cb) {
    socket.emit('join', chatroomName, user, cb);
  }

  function leave(chatroomName) {
    socket.emit('leave', chatroomName);
  }

  return {
    registerHandler,
    unregisterHandler,
    message,
    changeVideo,
    changeVideoState,
    changeVideoTime,
    changeRoomMaster,
    changeMemberInfo,
    changePlaylist,
    goLive,
    sendLiveData,
    join,
    leave,
  };
}
