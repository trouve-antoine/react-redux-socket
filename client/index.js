const io = require('socket.io-client')
const { MakeSocketAction, IsSocketAction } = require('../common/socket-action')
const cutils = require('../common/utils')
const MakeBasicMiddleware = require('../common/handler-basic-logic')

const MakeReactActionSocketMiddleware = (url, rrsName) => {
  cutils.assertNonEmptyString(url)
  if(rrsName === undefined) { rrsName = cutils.randomString(6) }
  cutils.assertNonEmptyString(rrsName)

  const socket = io(url)

  const middleware = function({ dispatch, getState }) {
    const socketDispatch = function(action) {
      unsafeSocketDispatch( MakeSocketAction(action, rrsName) )
    }

    const socketEnv = { getState, socketDispatch, socket, dispatch }

    const unsafeSocketDispatch = function(action) {
      mp.handle_out(action, socketEnv, function(action) {
        mp.log("Send action to server: ", action)
        socket.emit('react redux action', action)
      })
    }

    socket.on('react redux action server', action => {
      mp.log("Got action from server: ", action)
      mp.handle_in(action, socketEnv, function(action) {
        dispatch(action)
      })
    })

    socket.on('react redux connected', () => {
      mp.log("Got connect message from server.")
      mp.on_connect(socketEnv)
    })

    /* TODO: send disconnect message */

    return function(next) {
      return function(action) {
        if( IsSocketAction(action) ) {
          mp.log("Got socket action", action)
          const actionRrsName = action.socket_meta && action.socket_meta.rrsName
          if( !actionRrsName || (actionRrsName === rrsName) ) {
            return socketDispatch(action)
          } else {
            mp.log("Ignores the action because of rrsName (should be " + rrsName + ")", action)
          }
        } else {
          mp.log("Got non-socket action", action)
          return next(action)
        }
      }
    }
  }

  const mp = MakeBasicMiddleware(middleware)

  return middleware
}

const ReactActionSocketMiddleware = MakeReactActionSocketMiddleware

module.exports = {
  ReactActionSocketMiddleware,
  MakeSocketAction
}
