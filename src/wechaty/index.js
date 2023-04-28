import { WechatyBuilder, ScanStatus, log } from 'wechaty'
import qrTerminal from 'qrcode-terminal'
import { defaultMessage } from './sendMessage.js'
// 扫码
function onScan(qrcode, status) {
  if (status === ScanStatus.Waiting || status === ScanStatus.Timeout) {
    // 在控制台显示二维码
    qrTerminal.generate(qrcode)
    const qrcodeImageUrl = ['https://api.qrserver.com/v1/create-qr-code/?data=', encodeURIComponent(qrcode)].join('')
    console.log('onScan:', qrcodeImageUrl, ScanStatus[status], status)
  } else {
    log.info('onScan: %s(%s)', ScanStatus[status], status)
  }
}

// 登录
function onLogin(user) {
  console.log(`${user} has logged in`)
  const date = new Date()
  console.log(`Current time:${date}`)
  console.log(`Automatic robot chat mode has been activated`)
}

// 登出
function onLogout(user) {
  console.log(`${user} has logged out`)
}

// 收到好友请求
async function onFriendShip(friendship) {
  return
}

/**
 * 消息发送
 * @param msg
 * @param isSharding
 * @returns {Promise<void>}
 */
async function onMessage(msg) {
  // 默认消息回复
  await defaultMessage(msg, bot)
}

// 初始化机器人
const CHROME_BIN = process.env.CHROME_BIN ? { endpoint: process.env.CHROME_BIN } : {}

export const bot = WechatyBuilder.build({
  name: 'WechatEveryDay',
  puppet: 'wechaty-puppet-wechat4u',
  puppetOptions: {
    uos: true,
    head: true,
    ...CHROME_BIN
  },
})

bot.on('scan', onScan)
bot.on('login', onLogin)
bot.on('logout', onLogout)
bot.on('message', onMessage)
bot.on('friendship', onFriendShip)

// 启动微信机器人
bot.start().then(() => console.log('Start to log in wechat...')).catch((e) => console.error(e))
