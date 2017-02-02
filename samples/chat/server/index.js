const resolve_path = require('path').resolve

require('local-include-js')
  .add(__dirname)
  .alias("@common", resolve_path(__dirname, "../common"))

const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http).of('app1');

const ioActionHandler = require('react-redux-socket/server')

const socketAuth = include('@common/socket-authenticate')

const log = console.log

const defaultHandlers = require('react-redux-socket/server/handlers/')

ioActionHandler(
  io,
  defaultHandlers.authenticate(socketAuth.promiseServerAuthenticate).log(log),
  defaultHandlers.joinRoom(socketAuth.serverRoomName).log(log),
  defaultHandlers.logConnection(log),
  include('handlers/messages').log(log))

http.listen(3000, function(){
  log('listening on *:3000');
});
