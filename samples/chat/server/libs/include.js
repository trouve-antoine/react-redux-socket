module.exports = function(...base_dirs){
  /********* Makes sure files are resolve from the project's root */
  /* tribute to https://coderwall.com/p/th6ssq/absolute-paths-require */
  
  global.include = function(file) {
    for(let i=0; i<base_dirs.length; i++) {
      const dir = base_dirs[i]
      const path = dir +'/' + file
      const isLast = i === (base_dirs.length-1)

      if(isLast) {
        return require(path)
      }

      try {
        return require(path)
      } catch(e) {
        if(e.code !== 'MODULE_NOT_FOUND') { throw e }
        console.warn("Unable to find", path, ": move on to next folder in path")
      }
    }
  }
}
