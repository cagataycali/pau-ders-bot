const got = require('got')
const extract = require('./extract')

const getCsv = async (token, ctx) => {
  if (!check(ctx)) {
    throw new Error('CSV formatında gönderiniz.')
  }
  let document = ctx.message.document
  let result = await got(`https://api.telegram.org/bot${token}/getFile?file_id=${document.file_id}`)
  let path = JSON.parse(result.body).result.file_path
  result = await got(`https://api.telegram.org/file/bot${token}/${path}`)
  result = result.body.split('\n').slice(3).join('\n')
  return extract(result)
}

const check = (ctx) => {
  try {
    let type = ctx.message.document.mime_type
    console.log('TYPE', type, type === 'text/csv' || type === 'text/comma-separated-values')
    return type === 'text/csv' || type === 'text/comma-separated-values'
  } catch (e) {
    console.log(e)
    return false
  } finally {
    console.log('Checked Type')
  }
}

module.exports = {
  getCsv,
  check
}
