
const assert = require('assert')
const nikita = require('..')

describe('core', () => {
  it('load nikita', () =>
    nikita()
    .system.execute({
      command: 'hostname'
    }, (err, {stdout}) => {
      if(err) throw err
      assert(typeof stdout === 'string')
    })
    .promise()
  )
})
