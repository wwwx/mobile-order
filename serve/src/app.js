const express = require('express')
const bodyParser = require('body-parser') //用于req.body获取值的
const index = require('./routes/index')
const commonQuery = require('./routes/commonQuery')
const app = express()

// 解决跨域
app.all('*', function(req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header(
    'Access-Control-Allow-Headers',
    'Content-Type, Content-Length, Authorization, Accept, X-Requested-With'
  )
  res.header('Access-Control-Allow-Methods', 'PUT, POST, GET, DELETE, OPTIONS')
  if (req.method == 'OPTIONS') {
    res.send(200)
  } else {
    next()
  }
})

app.use(bodyParser.json())
// 创建 application/x-www-form-urlencoded 编码解析
// app.use(bodyParser.urlencoded({ extended: false }));

// API
app.use('/', index)
app.use('/commonquery', commonQuery)

app.listen(8083, () => {
  console.log('Server is running at http://localhost:8083')
})
