const refuseCredentials = (args) => {
  args.socketDispatch({
    type: "AUTHENTICATION_ERROR",
    payload: new Error("Wrong credentials")
  })
}

module.exports = (promiseCheckCredentials) => {
  const handler = (action, args, next) => {
    promiseCheckCredentials(action, args)
      .then(areCredentialsCorrect => {
        if(!areCredentialsCorrect) { return refuseCredentials(args) }
        next()
      })
  }

  let log = undefined;
  handler.log = _log => { log = _log; return handler }

  return handler
}
