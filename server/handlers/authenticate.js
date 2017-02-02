const refuseCredentials = (args) => {
  args.dispatch({
    type: "AUTHENTICATION_ERROR"
  })
  return false
}


module.exports = (promiseCheckCredentials) => {
  const handler = (action, args) => {
    return promiseCheckCredentials(action, args)
      .then(areCredentialsCorrect => {
        if(!areCredentialsCorrect) { return refuseCredentials(args) }
        return true
      })
  }

  let log = undefined;
  handler.log = _log => { log = _log; return handler }

  return handler
}
