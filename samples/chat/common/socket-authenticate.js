function roomName(action) {
  return "koko room"
}

/* client action translator_out */
function clientActionTranslator(action, getState) {
  const newAction = Object.assign({}, action)

  newAction.socket_meta.user = getState().credentials

  newAction.socket_meta.user.room = roomName(newAction)

  return newAction
}

/* server: get room name */
function serverRoomName(action, args) {
  if(action.socket_meta.system_message) { return }
  return action.socket_meta.user.room
}

/* server: check user and password */
/* try to use promise */
function promiseServerAuthenticate(action, args) {
  return new Promise( (resolve, reject) => {
    /* system message: no authentication */
    if(action.socket_meta.system_message) { return resolve(true) }

    console.log("action to check authentication", action)

    if(!action.socket_meta.user) { return resolve(false) }

    resolve( action.socket_meta.user.name === "koko"
      && action.socket_meta.user.password === "123toto" )
  })
}

module.exports = {
  clientActionTranslator,
  serverRoomName,
  promiseServerAuthenticate
}
