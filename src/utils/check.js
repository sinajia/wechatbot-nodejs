import { createHash } from 'node:crypto'
import nacl from 'tweetnacl'
import constData from '../../const.json' assert { type: 'json' }

const { publicKey } = constData
const secretKey = Buffer.from(constData.secretKey, 'hex')

function sign (message) {
  const signature = nacl.sign.detached(createHash('sha256').update(message).digest(), secretKey)
  return Buffer.from(signature).toString('hex')
}

export {
  sign,
  publicKey
}
