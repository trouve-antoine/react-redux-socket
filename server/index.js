const reactReduxSocketServer = function(io, ...handlers) {
  const broadcast = (action) => io.emit('react redux action server', action)

  io.on('connection', function(socket){
    const dispatch = (action) => socket.emit('react redux action server', action)

    const handle = (action) => {
      if(!action.meta) { action.meta = {} }
      if(!action.payload) { action.payload = {} }
      if(!action.socket_meta) { action.socket_meta = {} }

      const extraArgs = { dispatch, broadcast, socket, io }

      const handle_at = i => {
        if(i >= handlers.length) { return }

        const h = handlers[i]
        const hres = h(action, extraArgs)

        if(hres && (hres.constructor === Promise)) {
          hres.then(res => {
            if(res === false) { return }
            return handle_at(i+1)
          })
        } else {
          return handle_at(i+1)
        }
      }

      handle_at(0)
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

    socket.on('react redux action', function(action) {
      handle(action)
    })
  });

  /******* New convenient functions (1.6.0) */
  const self = reactReduxSocketServer
  self.handler = (...otherHandlers) => {
    otherHandlers.forEach(h => handlers.push(h))
    return self
  }
  self.plugin => (plugin) =>
    plugin(self)
    return self
  }
  return self
}

module.exports = reactReduxSocketServer
