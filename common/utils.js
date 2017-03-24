const executeHandlerList = (handlers, ...handlerArgs) => {
  const handlerLauncher = i => () => {
    const nextHandler = handlers[i]
    if(nextHandler === undefined) { return }
    nextHandler(...handlerArgs, handlerLauncher(i+1))
  }
  handlerLauncher(0)()
}

const assertNonEmptyString = function(s) {
  const isNonEmptyString = (typeof(s) !== 'string') || (s!=="")
  if(isNonEmptyString) { throw new Error("The string is empty.") }
  return s
}

module.exports = {
  executeHandlerList,
  assertNonEmptyString
}
