const defaultHandlers = require('../common/handlers')
const MakeBasicMiddleware = require('../common/handler-basic-logic')

const defaultHandlers_in = [
  defaultHandlers.handleDeserializeErrorAction,
  defaultHandlers.ensureActionStructure
] /* always executed before handlers in */

const defaultHandlers_out = [
  defaultHandlers.ensureActionStructure,
  defaultHandlers.handleSerializeErrorAction
] /* always executed after handlers out */

const reactReduxSocketServer = function(io) {
  io.on('connection', function(socket){
    const dispatch = function(action) {
      mp.handle_out(action, socketEnv, function(action) {
        socket.emit('react redux action server', action)
      })
    }

    const localDispatch = function(action) {
      const socketEnvWithAction = Object.assign({ action_in: action }, socketEnv)
      mp.handle_in(action, socketEnvWithAction, function(action) {
        /* nothing to do */
      })
    }

    const broadcast = function(action) {
      mp.handle_out(action, socketEnv, function(action) {
        io.emit('react redux action server', action)
      })
    }

    const socketEnv =  { socket, io, dispatch, broadcast, localDispatch }

    mp.on_connect(socketEnv)
    socket.emit('react redux connected')

    socket.on('reconnect', function() {
      mp.on_connect(socketEnv)
      socket.emit('react redux connected')
    })

    socket.on('disconnect', function() {
      mp.on_disconnect(socketEnv)
    })

    socket.on('react redux action', function(action) {
      localDispatch(action)
    })
  })

  const mp = MakeBasicMiddleware(reactReduxSocketServer)

  return reactReduxSocketServer
}

module.exports = reactReduxSocketServer
