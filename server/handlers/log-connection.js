module.exports = function(log) {
  return function(middleware) {
    middleware.onConnect(function({ socket }, next) {
      log && log('connected:', socket.id)
      next()
    })

    middleware.onDisconnect(function({ socket }, next) {
      log && log('disconnected: ', socket.id)
      next()
    })

    middleware.onActionIn(function(action, socketEnv, next) {
      const { isLocalAction, socket } = socketEnv
      
      if(isLocalAction) {
        log && log('action of type ' + action.type + ' for local')
      } else {
        log && log('action of type ' + action.type + ' for client ' + socket.id)
      }
      
      next()
    })
  }
}
