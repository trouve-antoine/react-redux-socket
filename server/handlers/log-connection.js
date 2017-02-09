module.exports = _log => {
  let log = _log
  const handler = function(action, { emit, broadcast, socket, io }) {

    switch(action.type) {
      case 'SOCKET_CONNECTED': {
        log && console.log('connected:', socket.id, "in room", action.socket_meta.room_name);
        break
      }
      case 'SOCKET_DISCONNECTED': {
        log && console.log('a user disconnected');
        break
      }
    }
  }

  handler.log = _log => { log = _log; return handler }

  return handler
}
