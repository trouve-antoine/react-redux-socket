const io = require('socket.io-client')

const socket = io('ws://localhost:3000/app1')

const SocketAction = function(action) {
  Object.assign(this, action)
  if(!this.payload) { this.payload  = { } }
  if(!this.meta) { this.meta = { } }
  if(!this.socket_meta) { this.socket_meta = { } }
}

const MakeSocketAction = function(action) {
  return new SocketAction(action)
}

const MakeReactActionSocketMiddleware = () => {
  const mp = {
    translate: (action, getState) => action,
    onInit: (dispatch, getState, socket) => { }
  }

  const socketDispatch = (action, getState) => {
    if(action.constructor === SocketAction) {
      socket.emit('react action', mp.translate(action, getState))
    } else {
      throw new Error("Unexpected action.")
    }
  }

  const middleware = ({ dispatch, getState }) => next => {
    socket.on('react redux action', action => {
      console.log('got action from server', action)
      next(action)
    })

    socket.on('react redux connected', () => {
      console.log('got init')
      mp.onInit(socketDispatch, getState, socket)
    })

    // mp.onInit(socketDispatch, getState, socket)
    // socket.on('connection', () => {
    //   mp.onInit(socketDispatch, getState, socket)
    // })
    // socket.on('reconnect', () => {
    //   mp.onInit(socketDispatch, getState, socket)
    // })

    return action => {
      if(action.constructor === SocketAction) {
        socketDispatch(action, getState)
      } else {
        return next(action)
      }
    }
  }

  middleware.translators = (...actionTranslators) => {
    mp.translate = (a, getState) => {
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

  return middleware
}

const ReactActionSocketMiddleware = MakeReactActionSocketMiddleware()

module.exports = {
  ReactActionSocketMiddleware,
  MakeSocketAction
}
