let log = undefined

module.exports = function(action, { emit, broadcast, socket, io }) {
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

module.exports.log = _log => { log = _log; return module.exports }
