const allPrefixes = new Map()
  allPrefixes.set('cow', "🐮")
  allPrefixes.set('fire', "🔥")
  allPrefixes.set('leaf', "🍀")
export { allPrefixes }

export const setPrefix = (prefix_id) => {
  return {
    type: 'SET_PREFIX_ID',
    payload: { prefix_id }
  }
}


export const incommingMessagesPrefixId = (oldState='cow', action) => {
  switch(action.type) {
    case 'SET_PREFIX_ID':
      return action.payload.prefix_id
    default:
      return oldState
  }
}
