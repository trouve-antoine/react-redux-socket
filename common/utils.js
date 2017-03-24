const executeHandlerList = (handlers, ...handlerArgs) => {
  const numberOfHandlers = handlers.length
  const handlerLauncher = i => () => {
    if(numberOfHandlers === i) { return }
    
    const nextHandler = handlers[i]
    if(nextHandler === undefined) { throw new Error("Undefined handler.") }
    nextHandler(...handlerArgs, handlerLauncher(i+1))
  }
  handlerLauncher(0)()
}

const assertNonEmptyString = function(s) {
  const isNonEmptyString = (typeof(s) !== 'string') || (s!=="")
  if(!isNonEmptyString) { throw new Error("The string is empty.") }
  return s
}

module.exports = {
  executeHandlerList,
  assertNonEmptyString
}
