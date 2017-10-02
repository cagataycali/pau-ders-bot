const { find } = require('./db')
const day = require('./day')

module.exports = async (ctx, username, id) => {
  id = id || ctx.message.chat.id
  username = username || ctx.message.chat.username
  console.log(id, username)
  let student = await find(username, id)
  let dayInsight
  try {
    dayInsight = day(student.lessons)
  } catch (e) {
    dayInsight = {
      message: 'Bugün dersin yok',
      reveals: undefined,
      lessons: undefined,
      nextLesson: undefined,
      code: 9
    }
  }
  return dayInsight
}
