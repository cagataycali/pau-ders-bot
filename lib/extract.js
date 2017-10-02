const {date, reverseDate, range} = require('./date')
const neatCsv = require('neat-csv')

const generate = (piece, ders) => {
  let {baslangic, bitis} = range(piece.birimAdi)
  return {
    saat: piece.birimAdi,
    ders: piece.ogrNo,
    ogretmen: piece.ad,
    yer: piece.Textbox14,
    baslangic,
    bitis,
    gun: reverseDate(ders)
  }
}

module.exports = async (_csv) => {
  let csv = await neatCsv(_csv)
  let student = csv.shift()
  student = {
    fakulte: student.birimAdi,
    brans: student.program,
    ogrenciNo: student.ogrNo,
    ad: student.ad,
    takvim: student.Textbox14
  }
  let days = []

  for (let piece of csv) {
    if (piece.ad && piece.program) {
      let ders = date(piece.program)
      try {
        days[ders].push(generate(piece, ders))
      } catch (e) {
        days[ders] = []
        days[ders].push(generate(piece, ders))
      }
    }
  }
  return {student, days}
}
