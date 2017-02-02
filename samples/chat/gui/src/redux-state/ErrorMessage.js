const errorMessage = (oldState='', action) => {
  switch(action.type) {
    case 'AUTHENTICATION_ERROR':
      return 'Authentication error'
    default:
      return ''
  }
}

export { errorMessage }
