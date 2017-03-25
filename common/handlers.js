const utils = require('./action')

const handleSerializeErrorAction = function(action, env, next) {
  utils.serializeErrorAction(action)
  next()
}

const handleDeserializeErrorAction = function(action, env, next) {
  utils.deserializeErrorAction(action)
  next()
}

const ensureActionStructure = function(action, env, next) {
  utils.ensureActionDefaultStructure(action)
  next()
}

const forwardBackSocketMeta = function(action, env, next) {
  if( ! env.action_in ) { return next() }
  const socket_meta_in = env.action_in.socket_meta
  if( !socket_meta_in ) { return next() }

  const socket_meta = Object.assign({}, socket_meta_in)
  Object.assign(socket_meta_in, action.socket_meta || {})

  action.socket_meta = socket_meta

  next()
}

module.exports = {
  handleSerializeErrorAction,
  handleDeserializeErrorAction,
  ensureActionStructure,
  forwardBackSocketMeta
}
