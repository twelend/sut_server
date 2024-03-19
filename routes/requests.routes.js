const Router = require('express').Router
const router = new Router()
const requsetsController = require('../controllers/requests.controller')

router.post('/createrequest', requsetsController.createRec)
router.get('/getrequests', requsetsController.getAll)
router.delete('/delete', requsetsController.deleteAll)


module.exports = router