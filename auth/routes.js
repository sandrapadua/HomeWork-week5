const {Router} = require('express')
const {toJWT, toData} = require('./jwt')
const User = require('../Users/model')
const router = new Router()
const auth = require('./middleware')
const bcrypt = require('bcrypt')

router.post('/tokens', (req, res) => {
  const email = req.body.email
  const password = req.body.password
  
  if (!email || !password) {
    res.status(400).send({
      message: 'Please supply a valid email and password'
    })
  }
  else {
    User
      .findOne({
        where: {
          email: req.body.email
        }
      })
      .then(entity => {
        if (!entity) {
          res.status(400).send({
            message: 'User with that email does not exist'
          })
        }

        // 2. use bcrypt.compareSync to check the password against the stored hash
        else if (bcrypt.compareSync(req.body.password, entity.password)) {

          // 3. if the password is correct, return a JWT with the userId of the user (user.id)
          res.send({
            jwt: toJWT({ userId: entity.id })
          })
        }
        else {
          res.status(400).send({
            message: 'Please supply a valid email and password'
          })
        }
      })
      .catch(err => {
        console.error(err)
        res.status(500).send({
          message: 'Something went wrong'
        })
      })
  }
})

router.get('/secret-endpoint', auth, (req, res) => {
  res.send({
    message: `Thanks for visiting the secret endpoint ${req.user.email}.`,
  }).catch(err => res.send(req.body))
})

module.exports = router