const Telegraf = require('telegraf')
const {Markup} = Telegraf
let token = process.env.TOKEN
const app = new Telegraf(token)
app.use(Telegraf.log())
const {check, getCsv} = require('./lib/getCsv')
const {find, upsert, findAll} = require('./lib/db')
const options = require('./lib/options')
const CronJob = require('cron').CronJob

app.command('start', async({from, reply}) => {
  let {id, username} = from
  let student = await find(username, id)
  if (student) {
    return reply('Tekrardan hoş geldin, ders programın için tekrardan bildirim almaya başlayacaksın. Ders programın değişti ise tekrar gönderebilirsin.', Markup
      .keyboard([
        ['🔍 Tüm dersler'],
        ['😎 Sıradaki ders']
      ])
      .oneTime()
      .extra()
    )
  } else {
    return reply('Merhaba, ders programını csv formatında gönderirsen sana düzenli aralıklarla derslerini göndereceğim.')
  }
})

app.on('document', async(ctx) => {
  if (check(ctx)) {
    let {id, username} = ctx.message.chat
    ctx.replyWithMarkdown('Ders programını işliyorum..')
    let csv = await getCsv(token, ctx)
    try {
      await upsert(username, csv, id)
      ctx.replyWithMarkdown('Ders programın *başarıyla* içe aktarıldı.')
      ctx.reply('Seçeneklerin..', Markup
        .keyboard([
          ['🔍 Tüm dersler'],
          ['😎 Sıradaki ders']
        ])
        .oneTime()
        .extra()
      )
    } catch (e) {
      ctx.replyWithMarkdown('Ders programını içe aktarırken *problem oluştu*, lütfen bana ulaş: @cagataycali')
    }
  } else {
    ctx.replyWithMarkdown('Ders programını *csv* formatında gönderir misin?')
  }
})

app.hears('🔍 Tüm dersler', async (ctx) => {
  app.telegram.sendMessage(ctx.message.chat.id, '🔍 Grr grr..')
  let response = await options(ctx)
  app.telegram.sendMessage(ctx.message.chat.id, response.message)
  if (response.code !== 9 && response.lessons && response.lessons.length > 0) {
    let message = response.lessons.map(lesson => {
      return `Ders: *${lesson.ders}*\nSaat: *${lesson.saat}*\nYer: *${lesson.yer}*\nÖğretmen: *${lesson.ogretmen}*`
    })
    message = message.join('\n\n')
    app.telegram.sendMessage(ctx.message.chat.id, message, {parse_mode: 'Markdown'})
  }
})

app.hears('😎 Sıradaki ders', async (ctx) => {
  app.telegram.sendMessage(ctx.message.chat.id, '🔍 Grr grr..')
  let response = await options(ctx)
  app.telegram.sendMessage(ctx.message.chat.id, response.message)
  if (response.code !== 9 && response.nextLesson) {
    let message = `Ders: *${response.nextLesson.ders}*\nSaat: *${response.nextLesson.saat}*\nYer: *${response.nextLesson.yer}*\nÖğretmen: *${response.nextLesson.ogretmen}*`
    app.telegram.sendMessage(ctx.message.chat.id, message, {parse_mode: 'Markdown'})
  } else {
    app.telegram.sendMessage(ctx.message.chat.id, 'Bir sonraki ders mevcut değil 😎')
  }
})

app.on('sticker', (ctx) => ctx.reply('👍'))

app.command('custom', ({ reply }) => {
  return reply('Seçeneklerin..', Markup
    .keyboard([
      ['🔍 Tüm dersler'],
      ['😎 Sıradaki ders']
    ])
    .oneTime()
    .extra()
  )
})

// app.telegram.sendMessage('149632499', 'all seçtin')
app.startPolling()

new CronJob('0 7 * * 1-5', function () {
  findAll()
    .then(async (students) => {
      for (let student of students) {
        let response = await options(null, student.username, student.id)
        app.telegram.sendSticker(student.id, 'CAADAgADgAIAApzW5wrl3QI5pxFGegI')
        app.telegram.sendMessage(student.id, 'Günaydın 🌝 Bugün derslerin şunlar ✨')
        if (response.code !== 9 && response.lessons && response.lessons.length > 0) {
          let message = response.lessons.map(lesson => {
            return `Ders: *${lesson.ders}*\nSaat: *${lesson.saat}*\nYer: *${lesson.yer}*\nÖğretmen: *${lesson.ogretmen}*`
          })
          message = message.join('\n\n')
          app.telegram.sendMessage(student.id, message, {parse_mode: 'Markdown'})
        }
      }
    })
    .catch(error => console.log(error))
}, null, true, 'Turkey')

new CronJob('0 21 * * 0-4', function () {
  findAll()
    .then(async (students) => {
      for (let student of students) {
        let response = await options(null, student.username, student.id)
        app.telegram.sendSticker(student.id, 'CAADAgADdwIAApzW5wr7Yz9udFZdUgI')
        app.telegram.sendMessage(student.id, 'İyi akşamlar, yarın derslerin şunlar,\n')
        if (response.code !== 9 && response.lessons && response.lessons.length > 0) {
          let message = response.lessons.map(lesson => {
            return `Ders: *${lesson.ders}*\nSaat: *${lesson.saat}*\nYer: *${lesson.yer}*\nÖğretmen: *${lesson.ogretmen}*`
          })
          message = message.join('\n\n')
          app.telegram.sendMessage(student.id, message, {parse_mode: 'Markdown'})
        }
      }
    })
    .catch(error => console.log(error))
}, null, true, 'Turkey')
