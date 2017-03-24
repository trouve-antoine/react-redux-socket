const { MakeReactActionSocketMiddleware } = require('../client')

const MakeReactlessActionSocketMiddleware = function(url, rrsName) {
  const reactMiddleware = MakeReactActionSocketMiddleware(url, name)

  const reactDispatchHandler = reactMiddleware()
  const dummyNextFunction = function() {}

  reactMiddleware.dispatch = reactDispatchHandler(dummyNextFunction)

  return reactMiddleware
}
