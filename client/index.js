const { MakeSocketAction, IsSocketAction } = require('../common/socket-action')
const cutils = require('../common/utils')
const MakeBasicMiddleware = require('../common/handler-basic-logic')

const NO_NAME = "NO_NAME"

const MakeReactActionSocketMiddleware = function(urlOrIoObject, rrsName) {
  let socket;
  if( typeof(urlOrIoObject) === 'string' ) {
    const url = urlOrIoObject
    cutils.assertNonEmptyString(url)
    socket = require('socket.io-client')(url)
  } else {
    socket = urlOrIoObject
  }

  if(rrsName === undefined) { rrsName = NO_NAME }
  cutils.assertNonEmptyString(rrsName)

  const middleware = function({ dispatch, getState }) {
    const socketDispatch = function(action, _rrsName) {
      unsafeSocketDispatch( MakeSocketAction(action, _rrsName || rrsName) )
    }

    const socketEnv = { getState, socketDispatch, socket, dispatch }

    const unsafeSocketDispatch = function(action) {
      const actionRrsName = (action.socket_meta && action.socket_meta.rrs_name) || NO_NAME
      if(actionRrsName !== rrsName) {
        return mp.log("Ignores action with different rrsName", action)
      }
      mp.handle_out(action, socketEnv, function(action) {
        mp.log("Send action to server: ", action)
        socket.emit('react redux action', action)
      })
    }

    socket.on('react redux action server', function(action) {
      mp.log("Got action from server: ", action)
      mp.handle_in(action, socketEnv, function(action) {
        dispatch(action)
      })
    })

    socket.on('react redux connected', function() {
      mp.log("Got connect message from server.")
      mp.on_connect(socketEnv)
    })

    /* TODO: send disconnect message */

    return function(next) {
      return function(action) {
        if( IsSocketAction(action) ) {
          const actionRrsName = (action.socket_meta && action.socket_meta.rrs_name) || NO_NAME
          if( actionRrsName === rrsName ) {
            // mp.log("Sends socket action", action)
            return socketDispatch(action)
          } else {
            // mp.log("Ignores the action because of rrsName (should be " + rrsName + ")", action)
            return next(action)
          }
        } else {
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
