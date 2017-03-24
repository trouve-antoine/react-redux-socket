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

module.exports = {
  handleSerializeErrorAction,
  handleDeserializeErrorAction,
  ensureActionStructure
}
