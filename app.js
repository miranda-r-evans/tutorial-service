const express = require('express')
const bodyparser = require('body-parser')
const cors = require('cors')

const app = express()

app.use(cors())

app.use(bodyparser.json())
app.use(bodyparser.urlencoded({ extended: false }))

app.use('/tutorial', require('./routes/tutorial'))

app.use((error, req, res, next) => {
  console.log(error)
  const status = error.statusCode || 500
  const message = error.message
  res.status(status).json({ message })
})

module.exports = app
