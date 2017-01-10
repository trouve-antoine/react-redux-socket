/*  Keep myself the list of connected sockets per room.
 *  The list managed by socket-io is not reliable after server reset with
 * some browsers (such as chrome)
 */
const socketsIdsPerRoomName = new Map()

module.exports = (getRoomName) => {
  const handler = (action, args) => {
    const roomName = getRoomName(action, args)
    const allRooms = Object.keys(args.socket.adapter.rooms)
    if(!socketsIdsPerRoomName.get(roomName)) { socketsIdsPerRoomName.set(roomName, []) }

    log && log("[", args.socket.id ,"]", "rooms", allRooms, '-->', roomName, "for action", action.type)

    if(roomName) {
      // const isInRoomAlready = allRooms.indexOf(roomName) >= 0
      const sid = args.socket.id
      const isInRoomAlready = socketsIdsPerRoomName.get(roomName).indexOf(sid) >= 0

      allRooms
        .filter(r => !isInRoomAlready || (r !== roomName))
        .forEach(r => { log && console.log("[", sid ,"]", "leave room", r); args.socket.leave(r) })


      if(!isInRoomAlready) {
        args.socket = args.socket.join(roomName)
        args.io = args.io.in(roomName)
        args.broadcast = action => args.io.emit('react redux action', action)

        socketsIdsPerRoomName.get(roomName).push(sid)
        log && console.log("[", sid ,"]", "join room", roomName)
      }

      action.socket_meta.room_name = roomName


      if(action.type === 'SOCKET_CONNECTED') {
        /* nothing */
      }

      if(action.type === 'SOCKET_DISCONNECTED') {
        // Does not work with all browsers a anyway
        // args.socket.leave(roomName)
      }
    }
  }

  let log = undefined;
  handler.log = _log => { log = _log; return handler }

  return handler
}
