const io = require('socket.io-client');

export default function() {
  const socket = io.connect('http://localhost:8080');
  // const socket = io.connect('https://ce9339a8.ngrok.io');

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

  function changeVideoState(chatroomName, status) {
    socket.emit('changeVideoState', { chatroomName, status });
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
    join,
    leave,
  };
}
