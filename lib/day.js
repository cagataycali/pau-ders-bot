var moment = require('moment')
moment.locale('tr')

// via https://stackoverflow.com/questions/9050345/
Array.prototype.last = function () {
  return this[this.length - 1]
}

// via ./c2 :)
Array.prototype.first = function () {
  return this[0]
}

function forNow () {
  let time = new Date()

  let minute = (time.getMinutes() < 10 ? '0' : '') + time.getMinutes()
  let hour = (time.getHours() < 10 ? '0' : '') + time.getHours()
  return [hour, minute].join(':')
}

module.exports = (data, hm = forNow()) => {
  let today = data.days[moment().day() - 1]
  let response = {}

  if (today === null) {
    response = {
      message: 'Gün bitti.',
      lessons: data.days[moment().day()],
      nextLesson: null,
      reveals: null,
      code: 0
    }
  } else {
    if (today.first().baslangic > hm) {
      let baslangic = moment(today.first().baslangic, 'HH:mm')
      let suan = moment(hm, 'HH:mm')
      response = {
        message: 'Gün henüz başlamadı.',
        reveals: baslangic.diff(suan, 'minutes'), // How many minute for revealing.
        lessons: today,
        nextLesson: today.first(),
        code: 1
      }
    } else if (today.last().bitis < hm) {
      response = {
        message: 'Gün bitti.',
        lessons: data.days[moment().day()],
        nextLesson: null,
        reveals: null,
        code: 0
      }
    } else { // In day
      for (let [index, lesson] of today.entries()) {
        let {baslangic, bitis} = lesson

        if (hm > bitis) {
          console.log('Bu derse girdin.', lesson.ders)
        } else if (hm < bitis && hm > baslangic) {
          response = {
            message: 'Derstesin, bir sonraki ders:',
            nextLesson: today[index + 1],
            lessons: today,
            reveals: null,
            code: 2
          }
          break
        } else {
          let bas = moment(`${baslangic}`, 'HH:mm')
          let suan = moment(`${hm}`, 'HH:mm')

          response = {
            message: 'Ders henüz başlamadı.',
            lessons: today,
            nextLesson: lesson,
            reveals: bas.diff(suan, 'minutes'),
            code: 3
          }
          break
        }
      }
    }
  }
  response.student = data.student
  return response
}
