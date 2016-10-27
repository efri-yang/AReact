var http = require('http');
var koa = require('koa');
var app = koa();
app.use(function *(){
  this.body = 'Hello World';
});
http.createServer(app.callback()).listen(3008);
http.createServer(app.callback()).listen(3009);
