var http = require('http');
var socketio = require('socket.io');

var server = http.createServer();

const io = socketio(server);

// ポート番号3333でHTTPサーバーが待ち受けるように設定する
server.listen(3333);


// クライアントとサーバーがコネクションを確立するとこの「connection」イベントが発生する
io.sockets.on('connection', function(socket) {

});
