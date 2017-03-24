const messages = []
let log = undefined

const { isSystemAction } = require('react-redux-socket/server')

const handleMessageActions = function(action, { socketDispatch, broadcast }, next){
  if(isSystemAction(action)) {
    console.log("Got system action", action)
    return next()
  }

  switch(action.type) {
    case 'GET_ALL_MESSAGES': {
      socketDispatch({
        type: 'SET_MESSAGES',
        payload: { messages }
      })
      break;
    }
    case 'SEND_MESSAGE': {
      const message = action.payload.message.value
      messages.push(message)
      broadcast({
        type: 'APPEND_MESSAGE',
        payload: { message }
      })
      break;
    }
  }

  next()
}

module.exports = function(reactReduxSocketServer) {
  reactReduxSocketServer.onActionIn(handleMessageActions)
}

module.exports.log = _log => { log = _log; return module.exports }
