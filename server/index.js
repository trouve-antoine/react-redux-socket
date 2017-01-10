module.exports = function(io, ...handlers) {
  const broadcast = (action) => io.emit('react redux action', action)

  io.on('connection', function(socket){
    const dispatch = (action) => socket.emit('react redux action', action)

    const handle = (action) => {
      if(!action.meta) { action.meta = {} }
      if(!action.payload) { action.payload = {} }
      if(!action.socket_meta) { action.socket_meta = {} }

      const extraArgs = { dispatch, broadcast, socket, io }
      handlers.every(h => {
        const res = h(action, extraArgs)
        return res !== false
      })
    }

    const system_message = true
    handle({ type: 'SOCKET_CONNECTED', socket_meta: { system_message } })
    socket.emit('react redux connected')

    socket.on('reconnect', function() {
      handle({ type: 'SOCKET_CONNECTED', socket_meta: { system_message } })
      socket.emit('react redux connected')
    })

    socket.on('disconnect', function() {
      handle({ type: 'SOCKET_DISCONNECTED', socket_meta: { system_message } })
    })

    socket.on('react action', function(action) {
      handle(action)
    })
  });
}
