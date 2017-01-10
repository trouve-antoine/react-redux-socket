module.exports = (checkCredentials) => {
  const handler = (action, args) => {
    if(!checkCredentials(action, args)) {
      args.dispatch({
        type: "AUTHENTICATION_ERROR"
      })
      return false
    }
  }

  let log = undefined;
  handler.log = _log => { log = _log; return handler }

  return handler
}
