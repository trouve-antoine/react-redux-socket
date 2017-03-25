const refuseCredentials = (args) => {
  args.dispatch({
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

  const plugin = function(m) {
    m.onActionIn(handler)
  }

  let log = undefined;
  plugin.log = _log => { log = _log; return plugin }

  return plugin
}
