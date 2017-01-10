function roomName(action) {
  return "koko room"
}

function clientActionTranslator(action) {
  const newAction = Object.assign({}, action)

  newAction.socket_meta.user = {
    name: "koko",
    password: "123toto"
  }

  newAction.socket_meta.user.room = roomName(newAction)

  return newAction
}

function serverRoomName(action, args) {
  if(action.socket_meta.system_message) { return }
  return action.socket_meta.user.room
}

function serverAuthenticate(action, args) {
  if(action.socket_meta.system_message) { return true }
  if(!action.socket_meta.user) { return false }
  return action.socket_meta.user.name === "koko"
    && action.socket_meta.user.password === "123toto"
}

module.exports = {
  clientActionTranslator,
  serverRoomName,
  serverAuthenticate
}
