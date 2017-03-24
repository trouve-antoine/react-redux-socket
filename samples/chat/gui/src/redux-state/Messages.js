import { MakeSocketAction } from 'react-redux-socket/client'
import { allPrefixes } from 'redux-state/IncommingMessagesPrefixId'

export const sendMessage = (message) => {
  return MakeSocketAction({
    type: "SEND_MESSAGE",
    payload: { message }
  })
}

export const initMessagesAtConnection = ({socketDispatch, getState, socket}, next) => {
  socketDispatch(MakeSocketAction({
    type: "GET_ALL_MESSAGES"
  }))
  next()
}

export const addPrefixToMessage = (prefix) => (action, {getState}, next) => {
  if(action.type === 'APPEND_MESSAGE') {
    const prefix_id = getState().incommingMessagesPrefixId
    const prefix_text = allPrefixes.get(prefix_id)

    action.payload.message = prefix_text + action.payload.message
  }
  next()
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
