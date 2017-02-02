import React from 'react'
import { Input, Button, Select, Form } from 'semantic-ui-react'
import { connect } from 'react-redux'
import { sendMessage } from 'redux-state/Messages'
import { setPrefix, allPrefixes } from 'redux-state/IncommingMessagesPrefixId'

const handleSendMessage = (message, props) => () => {
  props.dispatch( sendMessage(message) )
}

const handleMessageChange = (message, props) => (e, { value }) => {
  message.value = value
}

const handlePrefixChange = (props) => (e, { value }) => {
  props.dispatch( setPrefix(value) )
}

const options = [
  { key: 'cow', text: '🐮', value: 'cow' },
  { key: 'fire', text: '🔥', value: 'fire' }
]

const _message = { value: '' }
const CompositionForm = function(props) {
  const message = _message
  const prefixSelectOptions = [...allPrefixes.entries()].map(([prefix_id, prefix_name]) => {
    return { key: prefix_id, text: prefix_name, value: prefix_id }
  })

  return(
    <Form>
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
  )
}

export default connect(function(state) {
  return { incommingMessagesPrefixId: state.incommingMessagesPrefixId }
})(CompositionForm)
