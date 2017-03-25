const { MakeReactActionSocketMiddleware } = require('../client')

const MakeReactlessActionSocketMiddleware = function(url, rrsName) {
  const reactMiddleware = MakeReactActionSocketMiddleware(url, name)

  const f = function() { }
  const reactDispatchHandler = reactMiddleware({ /* dispatch: f, getState: f */ })
  reactMiddleware.dispatch = reactDispatchHandler(f)

  return reactMiddleware
}
