const ensureActionDefaultStructure = function(action) {
  if( (typeof(action) !== 'string') || (action === "") ) {
    throw new Error("Invalid action type (expected a non-empty string)", action)
  }

  if(!action.payload) { action.payload = {} }
  if(!action.meta) { action.meta = {} }
  if(!action.socket_meta) { action.socket_meta = {} }

  if( action.error && !(action.payload instanceof Error) ) {
    throw new Error("Invalid payload for action (expected an error object)", action)
  }

  if(action.payload instanceof Error) { action.error = true }

  return action
}

const deserializeErrorAction = function(action) {
  const isSerializedErrorAction = action.error

  if(!isSerializedErrorAction) { return action }

  try {
    action.payload = Object.assign(new Error(), action.payload)
  } catch(e) {
    /* ignore ? */
  }
}

const serializeErrorAction = function(action) {
  const serializerr = require('serializerr')
  ensureActionDefaultStructure(action)

  if(action.payload instanceof Error) {
    try {
      action.payload = serializerr(action.payload)
    } catch(e) {
      /* ignore ? */
    }
  }
  return action
}

module.exports = {
  ensureActionDefaultStructure,
  deserializeErrorAction,
  serializeErrorAction
}
