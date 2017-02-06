const convertErrorIfAny = action => {
  const serializerr = require('serializerr')

  if(action.payload instanceof Error) {
    action.payload = serializerr(action.payload)
    action.error = true
    if(!action.socket_meta) { action.socket_meta = {} }
    action.socket_meta.error = true
  }
  return action
}

const convertBackErrorActionFromClient = action => {
  if(action.error && action.socket_meta && action.socket_meta.error) {
    /* converts back error actions */
    try {
      action.payload = Object.assign(new Error(), action.payload)
    } catch(e) { console.warn("Unable to convert back the error action", action) }
  }
  return action
}


module.exports = function(io, ...handlers) {
  const broadcast = (action) => io.emit('react redux action server', convertErrorIfAny(action))

  io.on('connection', function(socket){
    const dispatch = (action) => socket.emit('react redux action server', convertErrorIfAny(action))

    const handle = (action) => {
      if(!action.meta) { action.meta = {} }
      if(!action.payload) { action.payload = {} }
      if(!action.socket_meta) { action.socket_meta = {} }

      action = convertBackErrorActionFromClient(action)

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
}
