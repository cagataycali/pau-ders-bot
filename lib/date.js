let days = ['PAZARTESI', 'SALI', 'ÇARŞAMBA', 'PERŞEMBE', 'CUMA', 'CUMARTESI', 'PAZAR']

module.exports.date = name => days.indexOf(name)

module.exports.reverseDate = index => days[index]

module.exports.range = string => {
  let [baslangic, bitis] = string.split(' - ')
  return {baslangic, bitis}
}
