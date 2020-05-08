const io = require('socket.io-client');

export default function() {
  const socket = io.connect('http://localhost:8080');

  function registerHandler(eventName, onDataReceived) {
    socket.on(eventName, onDataReceived);
  }

  function unregisterHandler(eventName) {
    socket.off(eventName);
  }

  function message(chatroomName, message) {
    socket.emit('message', { chatroomName, message });
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

  function register(name) {
    socket.emit('register', name);
  }

  function join(chatroomName, userName, cb) {
    socket.emit('join', chatroomName, userName, cb);
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
    register,
    join,
    leave,
  };
}
