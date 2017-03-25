module.exports = function(log) {
  return function(middleware) {
    middleware.onConnect(function({ socket }, next) {
      log && console.log('connected:', socket.id)
      next()
    })

    middleware.onConnect(function({ socket }, next) {
      log && console.log('a user disconnected: ', socket.id)
      next()
    })
  }
}
