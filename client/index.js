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

  const mp = {
    translate_in: (action, getState) => action,
    translate_out: (action, getState) => action,
    onInit: (dispatch, getState, socket) => { }
  }

  const socketDispatch = (action, getState) => {
    if(action.constructor === SocketAction) {
      if(log) { log("Send action to server: ", action) }
      socket.emit('react redux action', mp.translate_out(action, getState))
    } else {
      throw new Error("Unexpected action.")
    }
  }

  const middleware = ({ dispatch, getState }) => next => {
    socket.on('react redux action server', action => {
      if(log) { log("Got action from server: ", action) }
      dispatch(mp.translate_in(action, getState))
    })

    socket.on('react redux connected', () => {
      if(log) { log("Got init message from server.") }
      mp.onInit(socketDispatch, getState, socket)
    })

    return action => {
      if(action.constructor === SocketAction) {
        socketDispatch(action, getState)
      } else {
        return next(action)
      }
    }
  }

  middleware.translators_out = (...actionTranslators) => {
    mp.translate_out = (a, getState) => {
      actionTranslators.forEach(t => a = t(a, getState) || a)
      return a
    }
    return middleware
  }

  middleware.translators_in = (...actionTranslators) => {
    mp.translate_in = (a, getState) => {
      actionTranslators.forEach(t => a = t(a, getState) || a)
      return a
    }
    return middleware
  }

  middleware.onInit = (...initHandlers) => {
    mp.onInit = (...args) => {
      initHandlers.forEach(h => h(...args))
    }
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
