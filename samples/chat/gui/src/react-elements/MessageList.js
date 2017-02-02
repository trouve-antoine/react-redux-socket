import React from 'react'
import { connect } from 'react-redux'

const MessageList = (props) => {
  const messages = [...props.messages]
  messages.reverse()

  return (
    <ul>
    {messages.map((m,i) => (<li key={i}>{m}</li>))}
    </ul>
  )
}

export default connect(function(state) {
  return {
    messages: state.messages
  }
})(MessageList)
