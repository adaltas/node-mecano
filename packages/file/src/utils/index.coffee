
utils = require "@nikitajs/engine/src/utils"

module.exports = {
  ...utils
  curl: require './curl'
  ini: require './ini'
  partial: require './partial'
}
