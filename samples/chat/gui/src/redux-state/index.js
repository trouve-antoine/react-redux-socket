import { combineReducers } from 'redux'

import messages from 'redux-state/Messages'
import { incommingMessagesPrefixId } from 'redux-state/IncommingMessagesPrefixId'
import { credentials } from 'redux-state/Credentials'
import { errorMessage } from 'redux-state/ErrorMessage'

export default combineReducers({
  messages,
  incommingMessagesPrefixId,
  credentials,
  errorMessage
})
