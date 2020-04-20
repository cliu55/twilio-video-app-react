const io = require('socket.io-client');

export default function() {
  const socket = io.connect('http://localhost:8080');

  function registerHandler(onMessageReceived) {
    socket.on('message', onMessageReceived);
  }

  function unregisterHandler() {
    socket.off('message');
  }

  function message(message) {
    socket.emit('message', message);
  }

  return {
    registerHandler,
    unregisterHandler,
    message,
  };
}
