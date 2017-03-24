const io = require('socket.io-client')
const defaultHandlers = require('../common/handlers')
const MakeSocketAction = require('../common/make-socket-action')
const cutils = require('../common/utils')

const defaultHandlers_in = [
  defaultHandlers.handleDeserializeErrorAction,
  defaultHandlers.ensureActionStructure
] /* always executed before handlers in */

const defaultHandlers_out = [
  defaultHandlers.ensureActionStructure,
  defaultHandlers.handleSerializeErrorAction
] /* always executed after handlers out */

const MakeReactActionSocketMiddleware = (url, rrsName) => {
  cutils.assertNonEmptyString(url)
  if(rrsName === undefined) { rrsName = require('moniker').choose() }
  cutils.assertNonEmptyString(rrsName)

  const socket = io(url)

  let log = undefined

  const handlers_in = []
  const handlers_out = []
  const init_handlers = []

  const mp = {
    handle_in: function(action, socketEnv) {
      cutils.executeHandlerList(
        defaultHandlers_in.concat(handlers_in),
        action, socketEnv)
    },
    handle_out: function(action, socketEnv, last) {
      cutils.executeHandlerList(
        handlers_out.concat(defaultHandlers_out, last),
        action, socketEnv)
    },
    on_init: function(socketEnv) {
      cutils.executeHandlerList(init_handlers, socketEnv)
    }
  }

  const middleware = function({ dispatch, getState }) {
    const socketDispatch = function(action) {
      unsafeSocketDispatch( MakeSocketAction(action, rrsName) )
    }

    const socketEnv = { getState, socketDispatch, socket, dispatch }

    const unsafeSocketDispatch = function(action) {
      mp.handle_out(action, socketEnv, function(action) {
        if(log) { log("Send action to server: ", action) }

        socket.emit('react redux action', action)
      })
    }

    socket.on('react redux action server', action => {
      if(log) { log("Got action from server: ", action) }

      mp.handle_in(action, socketEnv)
    })

    socket.on('react redux connected', () => {
      if(log) { log("Got init message from server.") }
      mp.on_init(socketEnv)
    })

    return function(next) {
      return function(action) {
        if(action instanceof SocketAction) {
          const actionRrsName = action.socket_meta && action.socket_meta.rrsName
          if( !actionRrsName || (actionRrsName == rrsName) ) {
            return socketDispatch(action)
          }
        } else {
          return next(action)
        }
      }
    }
  }

  middleware.onActionIn = function() {
    const handlers = [].slice.call(arguments)
    handlers.forEach( function(h) { handlers_in.push(h) } )
    return middleware
  }

  middleware.onActionOut = function() {
    const handlers = [].slice.call(arguments)
    handlers.forEach( function(h) { handlers_out.push(h) } )
    return middleware
  }

  middleware.onInit = function() {
    const handlers = [].slice.call(arguments)
    handlers.forEach( function(h) { init_handlers.push(h) } )
    return middleware
  }

  middleware.plugins = function() {
    const plugins = [].slice.call(arguments)
    plugins.forEach( function(plugin) { plugin(middleware) } )
    return middleware
  }

  middleware.log = function(_log) {
    log = _log
    return middleware
  }

  return middleware
}

const ReactActionSocketMiddleware = MakeReactActionSocketMiddleware

module.exports = {
  ReactActionSocketMiddleware,
  MakeSocketAction
}
