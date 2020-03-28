var express = require('express')
var router = express.Router()
var emergentContacts = require('../json/emergentContacts.json')
var socialRelationShip = require('../json/socialRelationShip.json')
var userInfo = require('../json/userInfo.json')
var errorCode = {
  code: '0001',
  msg: 'error code',
  data: null
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

router.post('/adapt/getUrgeLoanPageForH5', async function(req, res) {
  await sleep(300)
  res.send(userInfo)
})

router.post('/adapt/tab', async function(req, res) {
  console.log('========= request start ============')
  console.log(req.body)
  if (req.body.code === 'tab_center_addressbook') {
    var list = []
    var first = socialRelationShip.data.body[req.body.current - 1]
    // console.log(first)
    var length = Math.min(req.body.size, socialRelationShip.data.total)
    for (var i = 0; i < length; i++) {
      list.push(first)
    }
    var result = JSON.parse(JSON.stringify(socialRelationShip))
    result.data.body = list
    await sleep(300)
    res.send(result)
  } else if (req.body.code === 'tab_center_contact') {
    // res.send(emergentContacts)
    var list = []
    var first = emergentContacts.data.body[req.body.current - 1]
    // console.log(first)
    var length = Math.min(req.body.size, emergentContacts.data.total)

    for (var i = 0; i < length; i++) {
      list.push(first)
    }
    var result = JSON.parse(JSON.stringify(emergentContacts))
    result.data.body = list
    await sleep(300)
    res.send(result)
  } else {
    await sleep(300)
    res.send(errorCode)
  }
})

module.exports = router
