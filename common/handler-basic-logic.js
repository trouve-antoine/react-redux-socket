const cutils = require('../common/utils')
const defaultHandlers = require('../common/handlers')

const defaultHandlers_in = [
  defaultHandlers.handleDeserializeErrorAction,
  defaultHandlers.ensureActionStructure
] /* always executed before handlers in */

const defaultHandlers_out = [
  defaultHandlers.ensureActionStructure,
  defaultHandlers.handleSerializeErrorAction,
  defaultHandlers.forwardBackSocketMeta
] /* always executed after handlers out */



module.exports = function(_middleware) {
  const handlers_in = []
  const handlers_out = []
  const connect_handlers = []
  const disconnect_handlers = []
  let log = undefined

  const private_middleware = {
    handle_in: function(action, socketEnv, last) {
      cutils.executeHandlerList(
        defaultHandlers_in.concat(handlers_in, last),
        action, socketEnv)
    },
    handle_out: function(action, socketEnv, last) {
      cutils.executeHandlerList(
        handlers_out.concat(defaultHandlers_out, last),
        action, socketEnv)
    },
    on_connect: function(socketEnv) {
      cutils.executeHandlerList(connect_handlers, socketEnv)
    },
    on_disconnect: function(socketEnv) {
      cutils.executeHandlerList(disconnect_handlers, socketEnv)
    },
    log: function(...args) {
      if(log) { log(...args) }
    }
  }

  const middleware = { }

  middleware.onActionIn = function() {
    const handlers = [].slice.call(arguments)
    handlers.forEach( function(h) { handlers_in.push(h) } )
    return _middleware
  }

  middleware.onActionOut = function() {
    const handlers = [].slice.call(arguments)
    handlers.forEach( function(h) { handlers_out.push(h) } )
    return _middleware
  }

  middleware.onConnect = function() {
    const handlers = [].slice.call(arguments)
    handlers.forEach( function(h) { connect_handlers.push(h) } )
    return _middleware
  }

  middleware.onDisconnect = function() {
    const handlers = [].slice.call(arguments)
    handlers.forEach( function(h) { disconnect_handlers.push(h) } )
    return _middleware
  }

  middleware.plugins = function() {
    const plugins = [].slice.call(arguments)
    plugins.forEach( function(plugin) { plugin(_middleware) } )
    return _middleware
  }

  middleware.log = function(_log) {
    log = _log
    return _middleware
  }

  Object.assign(_middleware, middleware)

  return private_middleware
}
