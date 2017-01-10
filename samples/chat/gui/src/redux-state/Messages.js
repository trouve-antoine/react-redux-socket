import { MakeSocketAction } from 'react-redux-socket/client'

export const sendMessage = (message) => {
  return MakeSocketAction({
    type: "SEND_MESSAGE",
    payload: { message }
  })
}

export const initMessagesAtConnection = (socketDispatch, getState, socket) => {
  socketDispatch(MakeSocketAction({
    type: "GET_ALL_MESSAGES"
  }))
}

export default function(oldState=[], action) {
  switch(action.type) {
  case 'SET_MESSAGES': {
    return action.payload.messages
  }
  case 'APPEND_MESSAGE': {
    return [ ...oldState, action.payload.message ]
  }
  default: {
    return oldState
  }
  }
}
