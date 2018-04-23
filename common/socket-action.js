const cutils = require('./utils')

const SocketAction = function(action, rrsName) {
  Object.assign(this, action)

  if(!this.payload) { this.payload  = { } }
  if(!this.meta) { this.meta = { } }
  if(!this.socket_meta) { this.socket_meta = { } }

  // replace the use of instanceof, as it does not work
  // when two versions of the lib are used
  this.___is_socket_action = "WATERMARK"

  if(rrsName) {
    /* the middleware name, in case you have more than one */
    cutils.assertNonEmptyString(rrsName)
    this.socket_meta.rrs_name = rrsName
  }
}

const MakeSocketAction = function(action, rrsName) {
  return new SocketAction(action, rrsName)
}

const IsSocketAction = function(action) {
  // replace the use of instanceof, as it does not work
  // when two versions of the lib are used
  return action.___is_socket_action === "WATERMARK"
}

module.exports = { MakeSocketAction, IsSocketAction }
