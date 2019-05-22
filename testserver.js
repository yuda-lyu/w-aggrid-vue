let express = require('express')
let app = express()
let path = require('path')

//port
let port = 9000

//all files
app.get('/*', function(req, res) {
    let fn = __dirname + req.path
    console.log('sendFile: ' + fn)
    res.sendFile(fn)
})

//listen
app.listen(port, function () {
  console.log('server running on port: ' + port)
})

