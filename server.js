const http = require('http')
const static = require('node-static')
const fs = require('fs')
const port = process.argv[2] || 8085
var file = new(static.Server)();

http.createServer((req, res) => {
   file.serve(req, res);
}).listen(port)

console.log('listening on port ', port)
