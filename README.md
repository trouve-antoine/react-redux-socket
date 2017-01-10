# react-redux-socket

Lightweight library to handle redux actions at server side using sockets.

That means that:

- redux actions from the server can be re-router to a server (instead of the redux reducers)
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
import { initMessagesAtConnection } from 'redux-state/Messages'

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
  type: "MY_ACTION_FROM_CLIENT"
}) )
```

## Server side (basic usage)

Example using express and socket.io (default):

```
const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http).of('app1');

const ioActionHandler = require('react-redux-socket/server')

const myHandler = function(action, { dispatch, broadcast }){
  switch(action.type) {
    case 'MY_ACTION_FROM_CLIENT':
      dispatch({ type: 'MY_ANSWER_TO_CLIENT' })
      break;
    case 'MY_OTHER_ACTION_FROM_CLIENT':
      broadcast({ type: 'MY_ANSWER_TO_ALL_CLIENTS' })
      break;
  }
}

ioActionHandler(io, myHandler)

http.listen(3000, function(){
  log('listening on *:3000');
});
```

The actions from the server are handled at client side like normal redux actions (in reducers).

## Advanced usage

### Client-side action translators

An action translator takes an action in input and output an action.
For instance, this one adds the `user` field from the state inside all the actions that are bound the socket server:

```
function clientActionTranslator(action, getState) {
  const newAction = Object.assign({}, action)

  newAction.socket_meta.user = getState().user

  return newAction
}
```

Translators are registered when creating the middleware:

```
ReactReduxSocketMiddleware("ws://localhost:3000/app1")
  .translators(clientActionTranslator)
```

### Client-side initialization hooks

It possible to execute some code each tome the socket is being connected or re-connected.
For instance, this one sends a `GET_STATE` message to the server:

```
function getStateAtConnection(socketDispatch, getState, socket) {
  socketDispatch(MakeSocketAction({
    type: "GET_STATE"
  }))
}
```

Initialization hooks are registered when creating the middleware:

```
ReactReduxSocketMiddleware("ws://localhost:3000/app1")
   .onInit(getStateAtConnection)
```

### Server-side handlers

Handlers are passed the following parameters:

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

### Action format

I advise to use the following members for actions objects:

- `payload`: redux action's content
- `meta`: redux action's metatdata
- `socket_meta`: metadata for the socket server

Those are created (as empty objects) at server-side if they do not exist.
Yet, you are free to use other other format: this won't cause any trouble.

## Hacking facts and reserved keywords

The library uses the socket message `react redux action` in order to transfer actions.

The onInit hook uses the custom socket message `react redux connected` (sent by the server to the client).
It is send by the server at `connection` and `reconnect`.

## Sample chat program

The folder `samples/chat` contains a sample chat program that uses all the functions above, especially:

- authentication
- rooms
- initialization handler
