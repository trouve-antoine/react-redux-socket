import React from 'react'
import { Input, Button } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { sendMessage } from 'redux-state/Messages'

const handleSendMessage = (message, props) => () => {
  props.dispatch( sendMessage(message) )
}

const handleMessageChange = (message, props) => (e, { value }) => {
  message.value = value
}

const Title = function(props) {
  let message = { value: '' }

  return(
    <div>
    <Input onChange={handleMessageChange(message, props)} placeholder='message' />
    <Button onClick={handleSendMessage(message, props)}>send</Button>
    </div>
  )
}

export default connect(function(state) {
  return { }
})(Title)
