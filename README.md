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

An action to the server can now be sent as usual using the `dispatch` function, but after calling `MakeSocketAction` as follows:

```
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

### Client-side action translators (in, out)

An action translator takes an action in input and output an action.
For instance, this one adds the `user` field from the state inside all the actions that are bound the socket server:

```
function clientActionTranslator(action, getState) {
  const newAction = Object.assign({}, action)

  newAction.socket_meta.user = getState().user

  return newAction
}
```

There are two types of transltors:

- *in*: translate actions from the server before being dispatched
- *out*: translate actions from the client to server before being sent

Translators are registered when creating the middleware:

```
ReactReduxSocketMiddleware("ws://localhost:3000/app1")
  .translators_in(clientActionTranslator, translator2, translator3)
  .translators_out(...otherTranslators)
```

Translators are executed in the order specified at initialization, with side effects.
That is, `translator2` and `translator3` will be able to access `socket_meta.user` as specified by `clientActionTranslator`.

Translators are only called on actions from the client to the server, before sending to the server.
They are called with the following parameters:

- `action`: the action as returned by the previous translator
- `getState`: the redux function to access the application's state


### Client-side initialization hooks

It possible to execute some code each time the socket is being connected or re-connected.
For instance, this one sends a `GET_STATE` message to the server:

```
function getStateAtConnection(socketDispatch, getState, socket) {
  socketDispatch({
    type: "GET_STATE"
  })
}
```

Initialization hooks are registered when creating the middleware:

```
ReactReduxSocketMiddleware("ws://localhost:3000/app1")
   .onInit(getStateAtConnection)
```

It is possible to use both `onInit` and `translators`, with as many parameters as needed:

```
ReactReduxSocketMiddleware("ws://localhost:3000/app1")
   .onInit(getStateAtConnection, hook2, hook3)
   .translators(clientActionTranslator, translator2, translator3)
```

Initialization hooks are called with the following parameters:

- `dispatch`: the function that sends an action to the server. The call to `MakeSocketAction` is not necessary
- `getState`: the redux function to access the application's state
- `socket`: the socket object (from socket.io)

### Client-side action handlers

Action handlers are to trigger some extra server action upon the reception of a message from the server, *before* translation.
They are called with the following parameters:

- `action`: the action received from the server
- `getState`: the redux function to access the application's state
- `socketDispatch`: the function that sends an action to the server. The call to `MakeSocketAction` is not necessary

Handler functions can return `false` in order to prevent the action to be passed to further handlers, in translators and reducers. Any other output is ignored.

They are registers with the function `handlers` as follows:

```
ReactReduxSocketMiddleware("ws://localhost:3000/app1")
  .handlers(handle1, handle2)
```

They are executed in order.

### Client-side plugins

The `plugins` function allows libraries to add the translators and handlers at once.
Plugin functions take into input the middleware object and do not return anything:

```
function myPlugin(middleware) {
  middleware.translators(t1, t1)
  middleware.onInt(init_function)
  middleware.handlers(h1, h2, h3)
}
```

They are registers with the `plugins` function:

```
ReactReduxSocketMiddleware("ws://localhost:3000/app1")
  .plugins(plugin1, plugin2)
```

Plugins functions are executed in order.

### Server-side handlers

Handlers are called with the following parameters:

- `action`: the action
- `extraArgs`, an object that contains:

  - `dispatch`: the function to dispatch an action to client
  - `broadcast`: the function to send an action to all clients of the same namespace (or room if one use the room handler)
  - `socket`: the socket object used to send the action
  - `io`: the global io object

Handlers are executed in the order specified at creation:

```
const ioActionHandler = require('react-redux-socket/server')
ioActionHandler(io, handler1, handler2, handler3)
```
or

```
const ioActionHandler = require('react-redux-socket/server')
ioActionHandler(io)
  .handlers(handler1, handler2)
  .handlers(handler3)
```

In order to prevent the following handlers to be executed, a given handler should return false:

```
const handler2 = function(action, { dispatch, broadcast }){
  return false /* handler 3 won't be called */
}
```

Handlers may have side-effects within `action` and `extraArgs`:

```
const handler2 = function(action, args){
  args.broadcast = function(action) {
    throw new Error("You shall not broadcast")
  }
}
```

In this example, `handler1` will be able to use `broadcast`, but not `handler3`.

Handlers may also return Promises since version 1.3 of the package.

### Sever-side built-in handlers

The packages comes with four sample handlers you may use as-it, or only for reference.
They can be accessed in `react-redux-socket/handlers`:

- `authentication`: check user credentials (`handler2` is only executed if `checkUser` return true)

```
function checkUser(action, { dispatch, broadcast, socket, io }) {
  return action.user.name === 'brutus'
}

const defaultHandlers = require('react-redux-socket/server/handlers/')
ioActionHandler(
  io,
  defaultHandlers.authenticate(checkUser),
  handler2)
```

- `joinRoom`: make the socket join a single room. Change the scope of `broadcast` to this room (`handler2` broadcast function will be scoped to the room returned by `putInRoom`):

```
function putInRoom(action, { dispatch, broadcast, socket, io }) {
  return action.user.room || `default-room`
}

const defaultHandlers = require('react-redux-socket/server/handlers/')
ioActionHandler(
  io,
  defaultHandlers.joinRoom(putInRoom),
  handler2)
```

- `logConnection`: logs connection and connections

```
const log = console.log
const defaultHandlers = require('react-redux-socket/server/handlers/')
ioActionHandler(
  io,
  defaultHandlers.logConnection(log))
```

It is possible to attach a logger function to `joinRoom` and `authenticate` using the chained `log` function:

```
const log = console.log
const defaultHandlers = require('react-redux-socket/server/handlers/')

ioActionHandler(
  io,
  defaultHandlers.authenticate(socketAuth.serverAuthenticate).log(log),
  defaultHandlers.joinRoom(socketAuth.serverRoomName).log(log),
  defaultHandlers.logConnection(log),
  include('handlers/messages').log(log))
```

### Sever-side plugins

The server function supports the convenient plugins function that allows modules to register as many handlers are necessary without exposing them:

```
const registerHandlers = (ioActionHandler) => {
  ioActionHandler
    .handlers(privateHandler1, privateHandler2)
    .handlers(privateHandler3)
}

ioActionHandler(io).plugins(registerHandlers)
```

### Action format and Error Actions

I advise to use the following members for actions objects:

- `payload`: redux action's content
- `meta`: redux action's metatdata
- `socket_meta`: metadata for the socket server
- `error`: true if the action is an error

Those are created (as empty objects) at server-side if they do not exist.
Yet, you are free to use other other format: this won't cause any trouble.

If the `payload` is an instance of `Error`, the action is considered to be an error.
Such actions between the client and the server are serialized / de-serialized.
In this case the fields `error` and `socket_meta.error` of the action are forced to true.

### Server-side system actions

System actions are actions triggered from the server.
They are sent generated by the library, and sent to the server's handlers.
Such actions can be recognized because they have the member `socket_meta.system_message` set to `true`.
They can be tested using this code (e.g. in server-side handlers):

```
const { isSystemAction } = require('react-redux-socket/server')

function someHandler(action, { dispatch, broadcast, socket, io }) {
  if( isSystemAction(action) ) { return /* ignores system actions */ }

  /* do something with non-system actions */
}
```

If a client tries to send an action with `socket_meta.system_message` set to true (or any other value that evaluates to true in JS), the action is ignored and an error is printed at server-side.

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
