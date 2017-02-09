const io = require('socket.io-client')

const SocketAction = function(action) {
  Object.assign(this, action)
  if(!this.payload) { this.payload  = { } }
  if(!this.meta) { this.meta = { } }
  if(!this.socket_meta) { this.socket_meta = { } }
}

const MakeSocketAction = function(action) {
  return new SocketAction(action)
}

const MakeReactActionSocketMiddleware = (url) => {
  const socket = io(url || 'ws://localhost:3000/app1')

  let log = undefined

  const convertBackErrorActionFromServer = action => {
    if(action.error && action.socket_meta && action.socket_meta.error) {
      /* converts back error actions */
      try {
        action.payload = Object.assign(new Error(), action.payload)
        if(log) { log("The action has been converted to an error action: ", action) }
      } catch(e) { if(log) { log("Unable to convert back the action error", e) } }
    }
    return action
  }

  const convertErrorIfAny = action => {
    const serializerr = require('serializerr')

    if(action.payload instanceof Error) {
      try {
        action.payload = serializerr(action.payload)
        action.error = true
        if(!action.socket_meta) { action.socket_meta = {} }
        action.socket_meta.error = true
        if(log) { log("Converted action to error action: ", action) }
      } catch(e) { log("Unable to convert the error action", err) }
    }
    return action
  }

  const translators_in = []
  const translators_out = []
  const handlers = []
  const initHandlers = []

  const mp = {
    translate_in: (a, ...args) => {
      translators_in.forEach(t => a = t(a, ...args) || a)
      return a
    },
    translate_out: (a, ...args) => {
      translators_out.forEach(t => a = t(a, ...args) || a)
      return a
    },
    handle: (...args) => {
      return handlers.every(h => h(...args) !== false)
    },
    onInit: (...args) => {
      initHandlers.forEach(h => h(...args))
    }
  }

  const middleware = ({ dispatch, getState }) => next => {
    const socketDispatch = (action) => {
      if(action.constructor === SocketAction) {
        unsafeSocketDispatch(action)
      } else {
        throw new Error("Unexpected action.")
      }
    }

    const convertAndSocketDispatch = action => {
      let socketAction = MakeSocketAction(action)
      unsafeSocketDispatch(socketAction)
    }

    const unsafeSocketDispatch = action => {
      if(log) { log("Send action to server: ", action) }
      socket.emit(
        'react redux action',
        convertErrorIfAny(mp.translate_out(action, getState, /* hack */ dispatch, socketDispatch)))
    }

    socket.on('react redux action server', action => {
      if(log) { log("Got action from server: ", action) }

      action = convertBackErrorActionFromServer(action)

      if(mp.handle(action, getState, convertAndSocketDispatch, /* hack */ dispatch)) {
        dispatch(mp.translate_in(action, getState, /* hack */ dispatch, socketDispatch))
      } else if(log) {
        log("The action has been canceled out by the handles: ", action)
      }
    })

    socket.on('react redux connected', () => {
      if(log) { log("Got init message from server.") }
      mp.onInit(convertAndSocketDispatch, getState, socket, /* hack */ dispatch)
    })

    return action => {
      if(action.constructor === SocketAction) {
        socketDispatch(action)
      } else {
        return next(action)
      }
    }
  }

  middleware.translators_out = (...actionTranslators) => {
    actionTranslators.forEach(t => translators_out.push(t))
    return middleware
  }

  middleware.translators_in = (...actionTranslators) => {
    actionTranslators.forEach(t => translators_in.push(t))
    return middleware
  }

  middleware.handlers = (...actionHandlers) => {
    actionHandlers.forEach(h => handlers.push(h))
    return middleware
  }

  middleware.onInit = (..._initHandlers) => {
    _initHandlers.forEach(h => initHandlers.push(h))
    return middleware
  }

  middleware.plugins = (...plugins) => {
    plugins.forEach(plugin => plugin(middleware))
    return middleware
  }

  middleware.log = (_log)  => {
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
