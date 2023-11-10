const postgres = require('./database')

const app = require('./app')

postgres
  .sync()
  .then(result => {
    console.log('Database connected')
    app.listen(5050)
  })
  .catch(err => console.log(err))
