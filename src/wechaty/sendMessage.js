import ini from 'ini'
import { readFileSync } from 'node:fs'
import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { getOpenAiReply as getReply } from '../openai/index.js'
import { roomFrequency, p2pFrequency } from '../utils/frequency.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const askmearr = [
  '问问题',
  '请回答',
  '回复我',
  '回答我'
]

function checkRoom(roomName, rooms) {
  for (const it of rooms) {
    if (roomName === it) {
      return true
    }
  }
  return false
}

function checkWord (sentance, wordfilter) {
  for (const it of wordfilter) {
    if (sentance.includes(it)) {
      return false
    }
  }
  return true
}

function checkAskMe (sentance) {
  for (const it of askmearr) {
    if (sentance.startsWith(it)) {
      return true
    }
  }
  return false
}

export async function defaultMessage(msg, bot) {
  if (!msg) {
    return
  }
  const config = ini.parse(readFileSync(resolve(__dirname, '..', '..', 'config.ini'), 'utf-8'))
  const atusername = `@${config.USER_NAME}`
  const rooms = config.GROUP_NAME.split(',')
  const wordfilter = config.WORD_FILTER.split(',')
  const remoteaddr = config.FOREIGN_ADDR

  console.log('-------------------------------------------------------')
  console.log('config', config.USER_NAME, rooms, wordfilter, remoteaddr)

  const contact = msg.talker()
  var content = msg.text()
  const room = msg.room()
  const roomName = (await room?.topic()) || null
  const roomId = room?.id || null
  const name = contact.name()
  const userid = contact.id

  console.log('原始消息内容', content)
  console.log('群名称', roomName)
  console.log('群ID', roomId)
  console.log('发送人微信名称', name)
  console.log('是否是自己', contact.self())
  console.log('消息类型', msg.type(), bot.Message.Type.Text)

  // 防止死循环
  if (contact.self()) {
    return
  }
  if (msg.type() > 10) {
    return
  }
  if(!remoteaddr) {
    return
  }
  if (!content) {
    return
  }

  // 文字
  if (msg.type() == bot.Message.Type.Text) {
    if ((Date.now() - 1e3 * msg.payload.timestamp) > 1e3 * 20) {
      return
    }

    content = content.trim()
    if (!content) {
      return
    }

    // 支持群消息
    if (roomId && roomName) {
      if (!content.startsWith(atusername)) {
        return
      }

      const trimed = content.substr(atusername.length)
      if (trimed.length < 2) {
        return
      }

      if (!checkRoom(roomName, rooms)) {
        console.log('群白名单没通过')
        return
      }

      if (!checkWord(trimed, wordfilter)) {
        console.log('关键词测试没通过')
        await room.say(`@${name} 请合理提问`)
        return
      }

      if (!roomFrequency(roomId)) {
        await room.say(`@${name} 正忙，请隔几秒再试`)
        return
      }

      try {
        await room.say(await getReply(trimed, userid, name, remoteaddr))
      } catch (e) {
        console.error(e.message ?? e)
      }
    } else {
      // 私人聊天
      if (!checkAskMe(content)) {
        return
      }

      try {
        const trimed = content.substr(3)
        if (trimed.length < 2) {
          await contact.say('请写下你的问题，例如：问问题，李白是哪个朝代的？')
          return
        }

        if (!p2pFrequency()) {
          await contact.say('正忙，请稍后再试')
          return
        }

        await contact.say(await getReply(trimed, userid, null, remoteaddr))
      } catch (e) {
        console.error(e.message ?? e)
      }
    }
  }

  // todo 处理其他消息类型

}
