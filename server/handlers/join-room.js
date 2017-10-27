/*  Keep myself the list of connected sockets per room.
 *  The list managed by socket-io is not reliable after server reset with
 * some browsers (such as chrome)
 */
const socketsIdsPerRoomName = new Map()

module.exports = (getRoomName) => {
  const handler = (action, socketEnv, next) => {
    if( socketEnv.isLocalAction ) { return next() /* this happens in case of localDispatch */ }
    
    const roomName = getRoomName(action, socketEnv)
    const allRooms = Object.keys(socketEnv.socket.adapter.rooms)
    if(!socketsIdsPerRoomName.get(roomName)) { socketsIdsPerRoomName.set(roomName, []) }

    log && log("[", socketEnv.socket.id ,"]", "rooms", allRooms, '-->', roomName, "for action", action.type)

    if(!roomName) { return next() }

    const sid = socketEnv.socket.id
    const isInRoomAlready = socketsIdsPerRoomName.get(roomName).indexOf(sid) >= 0

    allRooms
      .filter(r => !isInRoomAlready || (r !== roomName))
      .forEach(r => { log && console.log("[", sid ,"]", "leave room", r); socketEnv.socket.leave(r) })

    if(!isInRoomAlready) {
      socketEnv.socket = socketEnv.socket.join(roomName)
      socketEnv.io = socketEnv.io.in(roomName)
      socketEnv.broadcast = action => socketEnv.io.emit('react redux action', action)

      socketsIdsPerRoomName.get(roomName).push(sid)
      log && console.log("[", sid ,"]", "join room", roomName)
    }

    action.socket_meta.room_name = roomName


    if(action.type === 'SOCKET_CONNECTED') {
      /* nothing */
    }

    if(action.type === 'SOCKET_DISCONNECTED') {
      // Does not work with all browsers a anyway
      // socketEnv.socket.leave(roomName)
    }

    next()
  }

  const plugin = function(m) {
    m.onActionIn(handler)
    m.onDisconnect(function({socket}, next){
      /* TODO:  leave all rooms  */
      // socket.leave(roomName)
      next()
    })
  }

  let log = undefined;
  plugin.log = _log => { log = _log; return plugin }

  return plugin
}
