const resolve_path = require('path').resolve

require('local-include-js')
  .add(__dirname)
  .alias("@common", resolve_path(__dirname, "../common"))

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http).of('app1');

const socketAuth = include('@common/socket-authenticate')

const log = console.log

const defaultHandlers = require('react-redux-socket/server/handlers/')

const ioActionHandler = require('react-redux-socket/server')(io)
  .plugins(defaultHandlers.authenticate(socketAuth.promiseServerAuthenticate).log(log))
  .plugins(defaultHandlers.joinRoom(socketAuth.serverRoomName).log(log))
  .plugins(defaultHandlers.logConnection(log))
  .plugins(include('handlers/messages').log(log))

ioActionHandler.localDispatch({ type: 'SEND_MESSAGE',
  payload: {
    message: { value: 'This is the first message in this thread' }
  },
  meta: {},
  socket_meta: {
    rrs_name: 'NO_NAME',
    user: { name: 'koko', password: '123toto', room: 'koko room' }
  }
})

http.listen(3000, function(){
  log('listening on *:3000');
});
