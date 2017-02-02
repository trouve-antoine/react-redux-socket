import React from 'react'
import { Message, Input, Button, Select, Form } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { sendMessage } from 'redux-state/Messages'
import { setPrefix, allPrefixes } from 'redux-state/IncommingMessagesPrefixId'
import { setCredentials } from 'redux-state/Credentials'

const handleSendMessage = (message, props) => () => {
  const { value, user_name, password } = message
  props.dispatch( setCredentials(user_name, password) )
  props.dispatch( sendMessage({ value }) )
}

const handleMessageChange = (message, props) => (e, { value }) => {
  message.value = value
}

const handlePrefixChange = (props) => (e, { value }) => {
  props.dispatch( setPrefix(value) )
}

const handleChangeUserName = (message, props) => (e, { value }) => {
  message.user_name = value
}

const handleChangePassword = (message, props) => (e, { value }) => {
  message.password = value
}

const options = [
  { key: 'cow', text: '🐮', value: 'cow' },
  { key: 'fire', text: '🔥', value: 'fire' }
]

const _message = { value: '' }
const CompositionForm = function(props) {
  const message = _message
  message.user_name = props.user.name
  message.password = props.user.password

  const prefixSelectOptions = [...allPrefixes.entries()].map(([prefix_id, prefix_name]) => {
    return { key: prefix_id, text: prefix_name, value: prefix_id }
  })

  return(
    <div>
    <Form>
      <Form.Group widths='equal'>
        <Form.Input label="user name" defaultValue={props.user.name} onChange={handleChangeUserName(message, props)} />
        <Form.Input label="password" defaultValue={props.user.password} onChange={handleChangePassword(message, props)} />
      </Form.Group>
      <Form.Field>
        <label>Add prefix to new appended messages (example of translators_in)</label>
        <Select compact options={prefixSelectOptions} value={props.incommingMessagesPrefixId} onChange={handlePrefixChange(props)} />
      </Form.Field>
      <Form.Field>
        <label>Send a message</label>
        <Input type="text" onChange={handleMessageChange(message, props)} placeholder='message' action>
          <input/>
          <Button type='button' onClick={handleSendMessage(message, props)}>send</Button>
        </Input>
      </Form.Field>
    </Form>
    { props.errorMessage ? <Message error>{props.errorMessage}</Message> : undefined }
    </div>
  )
}

export default connect(function(state) {
  return {
    incommingMessagesPrefixId: state.incommingMessagesPrefixId,
    user: state.credentials,
    errorMessage: state.errorMessage
  }
})(CompositionForm)
