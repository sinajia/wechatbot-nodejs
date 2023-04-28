const { createHash } = require('node:crypto')
const nacl = require('tweetnacl')
const { secretKey, publicKey }  = require('../../const.json')
const key = Buffer.from(secretKey, 'hex')

function sign (message) {
  const signature = nacl.sign.detached(createHash('sha256').update(message).digest(), key)
  return Buffer.from(signature).toString('hex')
}

module.exports = {
  sign,
  publicKey
}
