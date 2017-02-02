export const setCredentials = (name, password) => {
  return {
    type: 'SET_CREDENTIALS',
    payload: { name, password }
  }
}

const defaultCredentials = {
  name: 'koko',
  password: '123toto'
}

export const credentials = (oldState=defaultCredentials, action) => {
  switch(action.type) {
    case 'SET_CREDENTIALS': {
      return action.payload
    }
    default: {
      return oldState
    }
  }
}
