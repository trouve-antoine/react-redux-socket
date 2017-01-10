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
import { clientActionTranslator } from 'common/socket-authenticate'

import { initMessagesAtConnection } from 'redux-state/Messages'

const store = createStore(
    RootReducer,
    applyMiddleware(
      Thunk,
      ReactActionSocketMiddleware
        .translators(clientActionTranslator)
        .onInit(initMessagesAtConnection))
  )

/********* Initialization event */


/********* The app */
import Title from 'react-elements/Title'
import MessageList from 'react-elements/MessageList'
import { Provider } from 'react-redux'

ReactDOM.render(
  <Provider store={store}>
    <div>
      <Title/>
      <MessageList/>
    </div>
  </Provider>,
  document.getElementById('main'));
