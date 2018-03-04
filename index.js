const express = require('express')
const bodyParser = require('body-parser')

const app = express()
var Sequelize = require('sequelize')
var sequelize = new Sequelize('postgres://postgres:secret@localhost:5432/postgres')
app.listen(4003, () => console.log('Express API listening on port 4003'))
app.use(bodyParser.json())


const Event = sequelize.define('event', {
  title: {
    type: Sequelize.STRING,
    allowNull: false
  },
  sdate: {
    type: Sequelize.DATE,
    allowNull: false
  },

  edate: {
    type: Sequelize.DATE,
    allowNull: false
  },

  description: {
    type: Sequelize.STRING,
    allowNull: false
  },
}, {
  tableName: 'events',
  timestamps: false
})
const { Op } = require('sequelize')

app.get('/events', (request, response) => {
  Event.findAll({
      where: {
        sdate: {[Op.gte]: new Date()}},
      attributes: ['title', 'sdate', 'edate']
  })
  .then(events => {
    response.send({ events })
  })
})


app.get('/events/:id', (request, response) => {
  const eventId = request.params.id
  Event.findById(eventId).then(events => {
    response.send({ events })
  })
})


app.post('/events', (req, res) => {
  const event = req.body
  const x = new Date(event.sdate)
  const y = new Date(event.edate)

   if (x > new Date() && y>x){
  Event.create(event)
    .then(entity => {
      res.json(entity)
      res.end()
    })
    .catch(err => {
    res.status(422)
    console.error(err);
    res.json({ message: 'Oops! There was an error getting the . Please try again' })
    })
  }
  else {
  res.status(401).send({
  message: 'Start date is not valid'})
  }
})

 const updateOrPatch = (req, res) => {
  const eventId = Number(req.params.id)
  const updates = req.body

  Event.findById(req.params.id)
    .then(entity => {
      return entity.update(updates)
    })
    .then(final => {
      res.json(final)
    })
    .catch(error => {
      res.status(500).send({
        message: `Something went wrong`,
        error
      })
    })
}

app.put('/events/:id', updateOrPatch)

app.delete('/events/:id', (req, res) => {
  const eventId = Number(req.params.id)
  Event.findById(req.params.id)
    .then(entity => {
      return entity.destroy()
    })
    .then(_ => {
      res.send({
        message: 'The event was deleted succesfully'
      })
    })
    .catch(error => {
      res.status(500).send({
        message: `Something went wrong`,
        error
      })
    })
})
