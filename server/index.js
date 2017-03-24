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
    const socketDispatch = function(action) {
      mp.handle_out(action, socketEnv, function(action) {
        socket.emit('react redux action server', action)
      })
    }

    const dispatch = function(action) {
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

    const socketEnv =  { socket, io, socketDispatch, broadcast, dispatch }

    dispatch({ type: 'SOCKET_CONNECTED', socket_meta: { system_action : true } })
    socket.emit('react redux connected')

    socket.on('reconnect', function() {
      dispatch({ type: 'SOCKET_CONNECTED', socket_meta: { system_action : true } })
      socket.emit('react redux connected')
    })

    socket.on('disconnect', function() {
      dispatch({ type: 'SOCKET_DISCONNECTED', socket_meta: { system_action : true } })
    })

    socket.on('react redux action', function(action) {
      if(action.socket_meta.system_action) {
        console.error("The incomming action is trying to send a system message: " + JSON.stringify(action))
        console.error("The socket object is: ", socket)
        return
      }
      dispatch(action)
    })
  })

  const mp = MakeBasicMiddleware(reactReduxSocketServer)

  return reactReduxSocketServer
}

/******* New convenient functions (1.7.1) */
reactReduxSocketServer.isSystemAction = action => {
  return action.socket_meta.system_action === true
}

module.exports = reactReduxSocketServer
