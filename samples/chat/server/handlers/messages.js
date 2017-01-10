const messages = []
let log = undefined

module.exports = function(action, { dispatch, broadcast }){
  switch(action.type) {
    case 'GET_ALL_MESSAGES': {
      dispatch({
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
}

module.exports.log = _log => { log = _log; return module.exports }
