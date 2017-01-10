import React from 'react'
import { connect } from 'react-redux'

let MessageList = (props) => {
  return (
    <ul>
    {props.messages.map((m,i) => (<li key={i}>{m}</li>))}
    </ul>
  )
}

export default connect(function(state) {
  return {
    messages: state.messages
  }
})(MessageList)
