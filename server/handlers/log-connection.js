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

    middleware.onActionIn(function(action, { socket }, next) {
      log && log('action of type ' + action.type + ' for ' + socket.id)
      next()
    })
  }
}
