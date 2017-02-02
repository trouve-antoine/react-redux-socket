/********* React base stuffs */
import React from 'react';
import ReactDOM from 'react-dom';

/********* Semantic UI */
import 'semantic-ui-css/semantic.min.css'

/********* Redux store */
import { createStore, applyMiddleware } from 'redux'
import Thunk from 'redux-thunk'
import RootReducer from 'redux-state'
import { ReactActionSocketMiddleware } from 'react-redux-socket/client'
import { clientActionTranslator } from '@common/socket-authenticate'

import { Segment } from 'semantic-ui-react'

import { initMessagesAtConnection, addPrefixToMessage } from 'redux-state/Messages'

const store = createStore(
    RootReducer,
    applyMiddleware(
      Thunk,
      ReactActionSocketMiddleware("ws://localhost:3000/app1")
        .translators_out(clientActionTranslator)
        .translators_in(addPrefixToMessage("🐮"))
        .onInit(initMessagesAtConnection))
  )

/********* Initialization event */


/********* The app */
import CompositionForm from 'react-elements/CompositionForm'
import MessageList from 'react-elements/MessageList'
import { Provider } from 'react-redux'

ReactDOM.render(
  <Provider store={store}>
    <Segment style={{ margin: '1em', maxWidth: '40em' }}>
      <CompositionForm/>
      <MessageList/>
    </Segment>
  </Provider>,
  document.getElementById('main'));
