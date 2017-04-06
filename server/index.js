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

const makeDispatchFunction = handle => (sockets=[], _socketEnv) => {
  if(sockets === undefined) { sockets = [] }
  if( !(sockets instanceof Array) ) { sockets = [ sockets ] }

  return (action, socketEnvExtra={}) => {
    const socketEnv = Object.assign({ from_action: action }, _socketEnv, socketEnvExtra)

    handle(action, socketEnv, function(action) {
      sockets.forEach( socket => socket.emit('react redux action server', action) )
    })
  }
}

const reactReduxSocketServer = function(io) {
  const mp = MakeBasicMiddleware(reactReduxSocketServer)

  const makeLocalDispatchFunction = socketEnv => makeDispatchFunction(mp.handle_in)([ /* no socket */ ], socketEnv)
  const makeDispatchOutFunction = makeDispatchFunction(mp.handle_out)
  Object.assign(reactReduxSocketServer, { makeLocalDispatchFunction, makeDispatchOutFunction })

  io.on('connection', function(socket){
    const localDispatchForActionIn = makeLocalDispatchFunction({ socket, io })

    const baseSocketEnv = populateSocketEnv({socket, io}) /* adds dispatch, broadcast and localDispatch */

    mp.on_connect(baseSocketEnv)
    socket.emit('react redux connected')

    socket.on('reconnect', function() {
      mp.on_connect(baseSocketEnv)
      socket.emit('react redux connected')
    })

    socket.on('disconnect', function() {
      mp.on_disconnect(baseSocketEnv)
    })

    socket.on('react redux action', function(action_in) {
      const widSocketEnv = populateSocketEnv({ socket, io }, { action_in })

      localDispatchForActionIn(action_in, widSocketEnv)
    })
  })

  /* - creates dispatch, broadcast and localDispatch
   * - add them to _baseSocketEnv (after copy) and returns it
   * - _baseSocketEnv is copied, merged with _baseSocketEnv and sent to dispatch, broadcast and localDispatch
   */
  const populateSocketEnv = (_baseSocketEnv, _extraSocketEnv) => {
    const { socket, io } = _baseSocketEnv

    baseSocketEnv = Object.assign({}, _baseSocketEnv)
    extraSocketEnv = Object.assign({}, _extraSocketEnv)
    localSocketEnv = Object.assign({ isLocalAction: true }, _extraSocketEnv)

    const dispatch = makeDispatchOutFunction(socket, extraSocketEnv)
    const broadcast = makeDispatchOutFunction(io, extraSocketEnv)
    const localDispatch = makeLocalDispatchFunction(localSocketEnv)

    Object.assign(baseSocketEnv, { dispatch, broadcast, localDispatch })
    Object.assign(extraSocketEnv, baseSocketEnv)
    Object.assign(localDispatch, baseSocketEnv)

    return baseSocketEnv
  }

  return reactReduxSocketServer
}


module.exports = reactReduxSocketServer
