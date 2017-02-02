import { combineReducers } from 'redux'

import messages from 'redux-state/Messages'
import { incommingMessagesPrefixId } from 'redux-state/IncommingMessagesPrefixId'

export default combineReducers({
  messages,
  incommingMessagesPrefixId
})
