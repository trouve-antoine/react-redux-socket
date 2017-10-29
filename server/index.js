const defaultHandlers = require('../common/handlers')
const MakeBasicMiddleware = require('../common/handler-basic-logic')

const reactReduxSocketServer = function(io) {
  const middleware = {}
  const mp = MakeBasicMiddleware(middleware)

  const makeLocalDispatchFunction = socketEnv => makeDispatchFunction(mp.handle_in)([ /* no socket */ ], socketEnv)
  const makeDispatchOutFunction = makeDispatchFunction(mp.handle_out)
  Object.assign(middleware, { makeLocalDispatchFunction, makeDispatchOutFunction })

  io.on('connection', function(socket) {
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

    const baseSocketEnv = Object.assign({}, _baseSocketEnv)
    const extraSocketEnv = Object.assign({}, _extraSocketEnv)
    const localSocketEnv = Object.assign({ isLocalAction: true }, _extraSocketEnv)
    
    const nop = function() { console.warn("This dispatch function is not available") }

    const dispatch = socket ? makeDispatchOutFunction(socket, extraSocketEnv) : nop
    const localOutDispatch = socket ? nop : makeDispatchOutFunction(socket, extraSocketEnv)
    const broadcast = makeDispatchOutFunction(io, extraSocketEnv)
    const localDispatch = makeLocalDispatchFunction(localSocketEnv)

    Object.assign(baseSocketEnv, { dispatch, broadcast, localDispatch, localOutDispatch })
    Object.assign(extraSocketEnv, baseSocketEnv)
    Object.assign(localSocketEnv, baseSocketEnv)
    
    return baseSocketEnv
  }

  const globalSocketEnv = populateSocketEnv({ io })
  
  Object.assign(middleware, globalSocketEnv)

  return middleware
}

module.exports = reactReduxSocketServer

const defaultHandlers_in = [
  defaultHandlers.handleDeserializeErrorAction,
  defaultHandlers.ensureActionStructure
] /* always executed before handlers in */

const defaultHandlers_out = [
  defaultHandlers.ensureActionStructure,
  defaultHandlers.handleSerializeErrorAction
] /* always executed after handlers out */

const makeDispatchFunction = handle => (sockets=[], _socketEnv) => {
  if( !(sockets instanceof Array) ) { sockets = [ sockets ] }

  return (action, socketEnvExtra={}) => {
    const socketEnv = Object.assign({ from_action: action }, _socketEnv, socketEnvExtra)
    
    handle(action, socketEnv, function(action) {
      sockets.forEach( socket => socket.emit('react redux action server', action) )
    })
  }
}