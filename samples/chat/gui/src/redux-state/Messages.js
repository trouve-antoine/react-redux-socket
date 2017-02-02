import { MakeSocketAction } from 'react-redux-socket/client'
import { allPrefixes } from 'redux-state/IncommingMessagesPrefixId'

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

export const addPrefixToMessage = (prefix) => (action, getState) => {
  switch(action.type) {
  case 'APPEND_MESSAGE':
    const prefix_id = getState().incommingMessagesPrefixId
    const prefix_text = allPrefixes.get(prefix_id)
    return {
      type: 'APPEND_MESSAGE',
      payload: {
        message: prefix_text + action.payload.message
      }
    }
  default:
    return action
  }
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
