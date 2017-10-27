# react-redux-socket

Lightweight library to handle redux actions at server side using sockets.

That means that:

- redux actions can be re-router to a server (instead of the redux reducers)
- a server can emit a redux action straight to the redux reducers

It supports connection and reconnection in a custom yet (I hope) reliable way.

The core is very light, but the built-in plugins (server-side built-in handlers) add simple support of:

- socket.io's rooms
- authentication

Check the source code to make you own !

It uses socket.io by default, but I guess it could be ported to other socket libraries without much troubles (I'm a bit worried about connection and re-connection though).

## News

**Version 2.2:** Adds `localDispatch` and `broadcast` in the server-side middleware object.

**Important change in version 2.0.8:** it is now possible to give directly the socket.io-client object to the client constructor, instead of just the string of the url.

**Breaking change in version 2.0.5:** action members other than type, meta, payload, socket_meta are deleted when sent through the wire (the cleansing is done in `common/action.js` function `ensureActionDefaultStructure`)

**Version 2 has been released. It is not compatible with version 1.x**:
- no translators anymore, only handlers in and out
- handlers are registered with `onActionIn` and `onActionOut`
- there is no system action anymore. If you need actions at connection use custom init handlers (with `onInit`)


## Client side (basic usage)

Implemented as a small redux middleware:

```
import { ReactReduxSocketMiddleware } from 'react-redux-socket/client'

const store = createStore(
    RootReducer,
    applyMiddleware(
      ReactReduxSocketMiddleware("ws://localhost:3000/app1")
    )
  )
```

or

```
import { ReactReduxSocketMiddleware } from 'react-redux-socket/client'
const io = require('socket.io-client')("ws://localhost:3000/app1")

const store = createStore(
    RootReducer,
    applyMiddleware(
      ReactReduxSocketMiddleware(io)
    )
  )
```

An action to the server can now be sent as usual using the `dispatch` function, but after calling `MakeSocketAction` as follows:

```
import { MakeSocketAction } from 'react-redux-socket/client'

dispatch( MakeSocketAction({
  type: "MY_ACTION_FROM_CLIENT_TO_SERVER"
}) )
```

Actions from the server can be processed in reducers like normal actions:

```
function myReducer(oldState, action) {
  switch(action.type) {
    case 'A_NORMAL_ACTION':
      /* do stuffs */
      return newState;
    case 'MY_ANSWER_FROM_SERVER_TO_CLIENT':
      /* do stuffs */
      return newState
  }
  return oldState
}
```

## Server side (basic usage)

Example of index file using express and socket.io (default):

```
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http).of('app1');

const ioActionHandler = require('react-redux-socket/server')

const myHandler = function(action, { dispatch, broadcast }){
  switch(action.type) {
    case 'MY_ACTION_FROM_CLIENT_TO_SERVER':
      dispatch({ type: 'MY_ANSWER_FROM_SERVER_TO_CLIENT' })
      break;
    case 'MY_OTHER_ACTION_FROM_CLIENT':
      broadcast({ type: 'MY_ANSWER_TO_ALL_CLIENTS' })
      break;
  }
}

ioActionHandler(io).handlers(myHandler) // or ioActionHandler(io, myHandler)

http.listen(3000, function(){
  log('listening on *:3000');
});
```

The actions from the server are handled at client side like normal redux actions (in reducers).

## Advanced usage

### Client-side action handlers

Action handlers replace the translators of version 1.x.

An action handler is defined as follow:

```
function handler(action, socketEnv, next) {
  const { getState, socketDispatch, socket, dispatch } = socketEnv

  /* process action and socket env */

  next() /* executes the next action handler */
}
```

The members of socketEnv are:

- `getState`: the redux function that gives access to the redux state
- `socketDispatch`: dispatch an action to the server (no need to call `MakeSocketAction`)
- `socket`: the socket connection object
- `dispatch`: the regular dispatch function (just in case)

If you need to send arguments between handlers, we recommend you to add members to `socketEnv`.

There are two types of action handlers:

- *in*: called when an action is recieved from the server
- *out*: called when an action is sent to the server

Handlers are registered when creating the middleware:

```
ReactReduxSocketMiddleware("ws://localhost:3000/app1")
  .onActionIn(h1, h2)
  .onActionIn(h3)
  .onActionOut(h4, h5)
```

Translators are executed in the order specified at initialization, with side effects:

- when an action from the server reaches the client `h1`, `h2` and `h3` are executed in this order (providing they call `next`)
- when an action is sent to the server (using `dispatch(MakeSocketAction(...))` or `socketDispatch(...)`), `h4` and `h5` are executed in this order before the action to be actually sent (providing they call `next`)

### Client-side initialization handler

It possible to execute some code each time the socket is being connected or re-connected.
For instance, this one sends a `GET_STATE` message to the server:

```
function getStateAtConnection(socketEnv, next) {
  socketDispatch({
    type: "GET_STATE"
  })
  next() /* executes the next Initialization handler */
}
```

Initialization handlers are registered when creating the middleware:

```
ReactReduxSocketMiddleware("ws://localhost:3000/app1")
   .onConnect(getStateAtConnection)
```

### Client-side plugins

The `plugins` function allows libraries to add the translators and handlers at once.
Plugin functions take into input the middleware object and do not return anything:

```
function myPlugin(middleware) {
  middleware.onConnect(init_function)
  middleware.onActionIn(h1, h2, h3)
  middleware.onActionOut(h4)
}
```

They are registers with the `plugins` function:

```
ReactReduxSocketMiddleware("ws://localhost:3000/app1")
  .plugins(myPlugin, plugin2)
```

Plugins functions are executed in order.

### Server-side handlers

Incommong and outgoing actions can be intercepted by handlers at server side too:

```
const ioActionHandler = require('react-redux-socket/server')
ioActionHandler(io)
  .onActionIn(h1, h2) /* action handlers (incomming) */
  .onActionOut(h3)  /* action handlers (outgoing) */
  .onDisconnect(hh1) /* non-action handlers (connected) */
  .onConnect(hh2) /* non-action handlers (disconnected) */
```

Action handlers are called with the following parameters:

- `action`: the action
- `socketEnv`, an object that contains:

  - `dispatch`: the function to dispatch an action to client
  - `broadcast`: the function to send an action to all clients of the same namespace (or room if one use the room handler)
  - `socket`: the socket object used to send the action
  - `io`: the global io object
  - `localDispatch`: dispatch an action inside the server (goes through the `onActionIn` handlers)

- `next`: the function to execute the next handler

Handlers are executed in the order specified at creation.

Non-action handlers are called with only `socketEnv` and `next`:

```
function actionHandler(action, socketEnv, next) {
  const { socket, io, dispatch, broadcast, localDispatch } = socketEnv

  next()
}

function nonActionHandler(socketEnv, next) {
  const { socket, io, dispatch, broadcast, localDispatch } = socketEnv

  next()
}
```

Server-side handlers can also be registerd with the `plugins` function:

```
function myPlugin(m) {
  m.onActionIn(h1, h2)
  m.onActionOut(h3, h4)
  m.onInit(hh1)
  m.plugins(myOtherPlugin)
}

ioActionHandler(io)
  .plugins(myPlugin)
```

### Multiple client middlewares

You can affect a name to your middleware instance in order to target it in `MakeSocketAction` as well as `socketDispatch`:

```
ReactReduxSocketMiddleware("ws://localhost:3000/app1", "m1")
ReactReduxSocketMiddleware("ws://localhost:3000/app2", "m2")

...

dispatch( MakeSocketAction(action, "m1") ) /* goes only in middleware m1 */

...

function myHandler(action, { socketDispatch }, next) {
  socketDispatch(action) /* dispathces to the same middleware as myHandler */
  socketDispatch(action, "m2") /* forces the middleware */
}

```

### Server-side globally available dispatch function

You can access to the `localDispatch` and `dispatch` functions from the server-side middleware object (from version 2.2).

```
const myIoActionHandler = require('react-redux-socket/server')(io)
  .onActionIn(h1, h2) /* action handlers (incomming) */
  
myIoActionHandler.broadcast(action) /* send to all connected clients */
myIoActionHandler.localDispatch(action) /* server-side handling */
```

In the case of a localDispatch, all the handlers are called the same as with a normal action coming from the client.
However, `socketEnv` won't contain the `socket` object  and the `dispatch` function.

### Sever-side built-in handlers

The packages comes with four sample handlers you may use as-it, or only for reference.
They can be accessed in `react-redux-socket/handlers`:

- `authentication`: check user credentials (`handler2` is only executed if `checkUser` return true)

```
function checkUser(action, { dispatch, broadcast, socket, io }) {
  return action.user.name === 'brutus'
}

const defaultHandlers = require('react-redux-socket/server/handlers/')
ioActionHandler(io)
  .plugins(defaultHandlers.authenticate(checkUser))
```

- `joinRoom`: make the socket join a single room. Change the scope of `broadcast` to this room (`handler2` broadcast function will be scoped to the room returned by `putInRoom`):

```
function putInRoom(action, { dispatch, broadcast, socket, io }) {
  return action.user.room || `default-room`
}

const defaultHandlers = require('react-redux-socket/server/handlers/')
ioActionHandler(io)
  .plugins(defaultHandlers.joinRoom(putInRoom))
```

- `logConnection`: logs connection and connections

```
const log = console.log
const defaultHandlers = require('react-redux-socket/server/handlers/')
ioActionHandler(io)
  .plugins(defaultHandlers.logConnection(log))
```

It is possible to attach a logger function to `joinRoom` and `authenticate` using the chained `log` function:

```
const log = console.log
const defaultHandlers = require('react-redux-socket/server/handlers/')

ioActionHandler(io)
  .plugins(
    defaultHandlers.authenticate(socketAuth.serverAuthenticate).log(log))
  .plugins(
    defaultHandlers.joinRoom(socketAuth.serverRoomName).log(log))
```

### Action format and Error Actions

Only the following members are supported in actions when sent through sockets:

- `payload`: redux action's content
- `meta`: redux action's metatdata
- `socket_meta`: metadata for the socket server
- `error`: true if the action is an error

Those are created (as empty objects) at server-side if they do not exist.
Yet, you are free to use other other format **locally**: this won't cause any trouble (but they will be deleted before being sent).

If the `payload` is an instance of `Error`, the action is considered to be an error.
Such actions between the client and the server are serialized / de-serialized.
In this case the field `error` of the action is forced to true.

## Hacking facts and reserved keywords

The library uses the socket message `react redux action` in order to transfer actions from the client to the server, and `react redux action server` for the other way around.

The onInit hook uses the custom socket message `react redux connected` (sent by the server to the client).
It is send by the server at `connection` and `reconnect`.

## Sample chat program

The folder `samples/chat` contains a sample chat program that uses all the functions above, especially:

- authentication
- rooms
- initialization handler
- translators in and out
