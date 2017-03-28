const { ReactActionSocketMiddleware } = require('../client')
const { MakeSocketAction } = require('../common/socket-action')

const ReactlessActionSocketClient = function(url, rrsName) {
  const reactMiddleware = ReactActionSocketMiddleware(url, rrsName)

  const reactDispatchHandler = reactMiddleware({})(() => {})

  reactMiddleware.dispatch = action =>
    reactDispatchHandler(MakeSocketAction(action))

  return reactMiddleware
}

module.exports = { ReactlessActionSocketClient }
