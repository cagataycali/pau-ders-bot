const mongoose = require('mongoose')

var Schema = new mongoose.Schema({
  username: { type: String, required: true },
  id: {type: String, unique: true, required: true},
  lessons: {}
})

var mongolabUri = process.env.MONGODB_URI
mongoose.connect(mongolabUri, (err) => {
  if (err) console.log(err)
})

var Student = mongoose.model('Students', Schema)

const find = async (username, id) => {
  try {
    let student = await Student.findOne({username, id}, {})
    return student
  } catch (e) {
    throw new Error(e)
  }
}

const findAll = async (username, id) => {
  try {
    let students = await Student.find({}, {})
    return students
  } catch (e) {
    throw new Error(e)
  }
}

const upsert = async (username, extracted, id) => {
  try {
    let doc = Student.findOneAndUpdate({id}, {username, lessons: extracted, id}, { upsert: true })
    return doc
  } catch (e) {
    throw new Error(e)
  }
}

module.exports = {
  find,
  findAll,
  upsert
}
