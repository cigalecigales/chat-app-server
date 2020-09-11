"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DISCONNECT = exports.GET_CURRENT_ROOM = exports.GET_ROOMS_LIST = exports.LEAVE_ROOM = exports.CONVERSATION = exports.JOIN_ROOM = exports.CREATE_ROOM = exports.CONNECTION = void 0;
// 接続
exports.CONNECTION = 'connection';
// チャットルーム作成
exports.CREATE_ROOM = 'create-room';
// チャットルームへの入室
exports.JOIN_ROOM = 'join-room';
// チャットでの会話
exports.CONVERSATION = 'conversation';
// チャットルームからの退室
exports.LEAVE_ROOM = 'leave-room';
// チャットルーム一覧の取得
exports.GET_ROOMS_LIST = 'get-rooms-list';
// 現在アクセスしているチャットルームの情報を取得
exports.GET_CURRENT_ROOM = 'get-current-room';
// 切断
exports.DISCONNECT = 'disconnect';
