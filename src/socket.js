const io = require('socket.io-client');

export default function() {
  const socket = io.connect('http://localhost:8080');

  function registerHandler(eventName, onDataReceived) {
    socket.on(eventName, onDataReceived);
  }

  function unregisterHandler(eventName) {
    socket.off(eventName);
  }

  function message(message) {
    socket.emit('message', message);
  }

  function changeVideo(url) {
    socket.emit('changeVideo', url);
  }

  function changeVideoState(status) {
    socket.emit('changeVideoState', status);
  }

  function changeVideoTime(time) {
    socket.emit('changeVideoTime', time);
  }

  return {
    registerHandler,
    unregisterHandler,
    message,
    changeVideo,
    changeVideoState,
    changeVideoTime,
  };
}
