"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var http_1 = __importDefault(require("http"));
var socket_io_1 = __importDefault(require("socket.io"));
var rooms_1 = __importDefault(require("./rooms"));
var Events = __importStar(require("./events"));
var utils_1 = require("./utils");
var server = http_1.default.createServer();
var io = socket_io_1.default(server);
// チャットルームID用のカウンター
var currentRoomIdCounter = 1;
// チャットルームIDの接頭辞
var ROOM_NAME_PREFIX = 'ROOM_';
// クライアントとサーバーがコネクションを確立すると「connection」イベントが発生
io.sockets.on(Events.CONNECTION, function (socket) {
    // 現在のルームID
    var currentRoomId;
    /**
     * チャットルームの作成
     */
    socket.on(Events.CREATE_ROOM, function (data) {
        // ルームIDの生成
        var roomId = ROOM_NAME_PREFIX + currentRoomIdCounter++;
        // ルーム情報作成
        var room = {
            id: roomId,
            name: data.roomName,
            users: [],
            logs: []
        };
        // ルーム情報保存
        rooms_1.default.push(room);
        // 返却データの作成
        var result = {
            type: Events.CREATE_ROOM,
            rooms: rooms_1.default
        };
        io.emit(Events.CREATE_ROOM, result);
    });
    /**
     * チャットルーム入室
     */
    socket.on(Events.JOIN_ROOM, function (data) {
        // ルームID
        var roomId = data.roomId;
        // 現在のチャットルームIDを保存
        currentRoomId = roomId;
        for (var _i = 0, rooms_2 = rooms_1.default; _i < rooms_2.length; _i++) {
            var room = rooms_2[_i];
            // 既存のチャットルームに存在するルームIDの場合
            if (room.id === roomId) {
                // ルームメンバーを追加
                room.users.push({
                    socketId: socket.id,
                    name: data.userName
                });
                // 該当のチャットルームに参加
                socket.join(room.id);
                // 返却データ
                var result = {
                    type: Events.JOIN_ROOM,
                    roomId: roomId,
                    userName: data.userName,
                    users: room.users
                };
                io.emit(Events.JOIN_ROOM, result);
                break;
            }
        }
    });
    /**
     * 会話
     */
    socket.on(Events.CONVERSATION, function (data) {
        // ルームID
        var roomId = data.roomId;
        // メッセージ
        var message = data.message;
        // 現在日時
        var currentDate = utils_1.formatDate('yyyy/MM/dd HH:mm:ss');
        for (var _i = 0, rooms_3 = rooms_1.default; _i < rooms_3.length; _i++) {
            var room = rooms_3[_i];
            if (room.id === roomId) {
                room.logs.push({
                    logId: room.logs.length + 1,
                    userName: data.userName,
                    time: currentDate,
                    message: message
                });
                break;
            }
        }
        // 返却データ
        var result = {
            type: Events.CONVERSATION,
            roomId: roomId,
            userName: data.userName,
            time: currentDate,
            message: message
        };
        io.emit(Events.CONVERSATION, result);
    });
    /**
     * チャットルーム一覧取得
     */
    socket.on(Events.GET_ROOMS_LIST, function () {
        var result = {
            type: Events.GET_ROOMS_LIST,
            rooms: rooms_1.default
        };
        io.emit(Events.GET_ROOMS_LIST, result);
    });
    /**
     * 現在のチャットルームの情報取得
     */
    socket.on(Events.GET_CURRENT_ROOM, function (data) {
        var currentRoom = rooms_1.default.filter(function (d) { return d.id === data.roomId; });
        if (currentRoom.length === 1) {
            var result = {
                type: Events.GET_CURRENT_ROOM,
                roomId: currentRoom[0].id,
                roomName: currentRoom[0].name,
                users: currentRoom[0].users,
                logs: currentRoom[0].logs
            };
            io.emit(Events.GET_CURRENT_ROOM, result);
        }
    });
    /**
     * チャットルーム退室
     */
    socket.on(Events.LEAVE_ROOM, function () {
        if (currentRoomId) {
            // 接続が切れる際に該当チャットルームからユーザーを削除する
            outer: for (var _i = 0, rooms_4 = rooms_1.default; _i < rooms_4.length; _i++) {
                var room = rooms_4[_i];
                if (room.id === currentRoomId) {
                    for (var i = 0; i < room.users.length; i++) {
                        if (room.users[i].socketId === socket.id) {
                            room.users.splice(i, 1);
                            socket.leave(currentRoomId);
                            break outer;
                        }
                    }
                }
            }
            var result = {
                type: Events.LEAVE_ROOM,
                roomId: currentRoomId,
                socketId: socket.id
            };
            io.emit(Events.LEAVE_ROOM, result);
        }
    });
    /**
     * 接続切断
     */
    socket.on(Events.DISCONNECT, function () {
        if (currentRoomId) {
            // 接続が切れる際に該当チャットルームからユーザーを削除する
            outer: for (var _i = 0, rooms_5 = rooms_1.default; _i < rooms_5.length; _i++) {
                var room = rooms_5[_i];
                if (room.id === currentRoomId) {
                    for (var i = 0; i < room.users.length; i++) {
                        if (room.users[i].socketId === socket.id) {
                            room.users.splice(i, 1);
                            socket.leave(currentRoomId);
                            break outer;
                        }
                    }
                }
            }
            var result = {
                type: Events.DISCONNECT,
                roomId: currentRoomId,
                socketId: socket.id
            };
            io.emit(Events.DISCONNECT, result);
        }
    });
});
// ポート番号3333でHTTPサーバーが待ち受けるように設定する
server.listen(3333, function () { return console.log("listening on *:3333"); });
