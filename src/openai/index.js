import { remark } from 'remark'
import stripMarkdown from 'strip-markdown'
import fetch from 'node-fetch'
import { createHash } from 'node:crypto'
import randomstring from 'randomstring'
import utilsCheck from '../utils/check.cjs'

const { sign, publicKey } = utilsCheck

export async function getOpenAiReply(prompt, userid, name, remoteaddr) {
  var reply = ''
  var uniqueid = undefined
  if (userid) {
    uniqueid = createHash('md5').update(userid).digest().toString('hex')
  }

  const message = randomstring.generate({
    length : 12
  })
  const timestamp = Date.now()

  {
    const rs = await fetch(remoteaddr, {
      method: 'POST',
      body: JSON.stringify({
        prompt,
        timestamp,
        message,
        signature: sign(`${timestamp}${message}`),
        uniqueid,
        publicKey
      }),
      headers: { 'Content-Type': 'application/json' }
    })

    const rjson = await rs.json()

    if (rjson.code === 0) {
      reply = markdownToText(rjson.r.answer)
    } else {
      reply = rjson.errMsg ?? '请求过于频繁'
    }
  }
  console.log('🚀🚀🚀 / reply', reply)
  if (name) {
    return `@${name} ${reply}`
  } else {
    return reply
  }

}

function markdownToText(markdown) {
  return remark()
    .use(stripMarkdown)
    .processSync(markdown ?? '')
    .toString()
}
