const cutils = require('./utils')

const SocketAction = function(action, rrsName) {
  Object.assign(this, action)
  
  if(!this.payload) { this.payload  = { } }
  if(!this.meta) { this.meta = { } }
  if(!this.socket_meta) { this.socket_meta = { } }

  if(rrsName) {
    /* the middleware name, in case you have more than one */
    cutils.assertNonEmptyString(rrsName)
    this.socket_meta.rrs_name = rrsName
  }
}

const MakeSocketAction = function(action, rrsName) {
  return new SocketAction(action, name)
}

module.exports = MakeSocketAction
