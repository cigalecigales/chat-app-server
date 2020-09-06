import http from 'http';
import socketio from 'socket.io';

import rooms, { Room } from './rooms'; 
import * as Types from './types';
import * as Events from './events';
import { formatDate } from './utils';

const server: http.Server = http.createServer();
const io: socketio.Server = socketio(server);

// チャットルームID用のカウンター
let currentRoomIdCounter: number = 1;
// チャットルームIDの接頭辞
const ROOM_NAME_PREFIX = 'ROOM_';


// クライアントとサーバーがコネクションを確立すると「connection」イベントが発生
io.sockets.on(Events.CONNECTION, (socket: socketio.Socket) => {

  // 現在のルームID
  let currentRoomId: string;

  /**
   * チャットルームの作成
   */
  socket.on(Events.CREATE_ROOM, (data: Types.CreateRoom) => {
    // ルームIDの生成
    const roomId: string = ROOM_NAME_PREFIX + currentRoomIdCounter++;
    // ルーム情報作成
    const room: Room = {
      id: roomId,
      name: data.roomName,
      users: [],
      logs: []
    };
    // ルーム情報保存
    rooms.push(room);

    // 返却データの作成
    const result: Types.CreateRoomResult = {
      type: Events.CREATE_ROOM,
      rooms: rooms
    };

    io.emit(Events.CREATE_ROOM, result);
  });

  /**
   * チャットルーム入室
   */
  socket.on(Events.JOIN_ROOM, (data: Types.JoinRoom) => {
    // ルームID
    const roomId = data.roomId;
    // 現在のチャットルームIDを保存
    currentRoomId = roomId;

    for (const room of rooms) {
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
        const result: Types.JoinRoomResult = {
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
  socket.on(Events.CONVERSATION, (data: Types.Conversation) => {
    // ルームID
    const roomId: string = data.roomId;
    // メッセージ
    const message: string = data.message;
    // 現在日時
    const currentDate: string = formatDate('yyyy/MM/dd HH:mm:ss');

    for (let room of rooms) {
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
    const result: Types.ConversationResult = {
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
  socket.on(Events.GET_ROOMS_LIST, () => {
    const result = {
      type: Events.GET_ROOMS_LIST,
      rooms: rooms
    };
    io.emit(Events.GET_ROOMS_LIST, result);
  });

  /**
   * 現在のチャットルームの情報取得
   */
  socket.on(Events.GET_CURRENT_ROOM, (data: Types.CurrentRoom) => {
    const currentRoom = rooms.filter(d => d.id === data.roomId);
    
    if (currentRoom.length === 1) {
      const result: Types.CurrentRoomResult = {
        type: Events.GET_CURRENT_ROOM,
        roomId: currentRoom[0].id,
        roomName: currentRoom[0].name,
        users: currentRoom[0].users,
        logs: currentRoom[0].logs
      }
      io.emit(Events.GET_CURRENT_ROOM, result);
    }
  });

  /**
   * チャットルーム退室
   */
  socket.on(Events.LEAVE_ROOM, () => {
    if (currentRoomId) {
      // 接続が切れる際に該当チャットルームからユーザーを削除する
      outer:
      for (const room of rooms) {
        if (room.id === currentRoomId) {
          for (let i = 0; i < room.users.length; i++) {
            if (room.users[i].socketId === socket.id) {
              room.users.splice(i, 1);
              socket.leave(currentRoomId);
              break outer;
            }
          }
        }
      }

      const result: Types.DisconnectRoomResult = {
        type: Events.LEAVE_ROOM,
        roomId: currentRoomId,
        socketId: socket.id
      }

      io.emit(Events.LEAVE_ROOM, result);
    }
  });

  /**
   * 接続切断
   */
  socket.on(Events.DISCONNECT, () => {
    if (currentRoomId) {
      // 接続が切れる際に該当チャットルームからユーザーを削除する
      outer:
      for (const room of rooms) {
        if (room.id === currentRoomId) {
          for (let i = 0; i < room.users.length; i++) {
            if (room.users[i].socketId === socket.id) {
              room.users.splice(i, 1);
              socket.leave(currentRoomId);
              break outer;
            }
          }
        }
      }

      const result: Types.DisconnectRoomResult = {
        type: Events.DISCONNECT,
        roomId: currentRoomId,
        socketId: socket.id
      }

      io.emit(Events.DISCONNECT, result);
    }
  });
});

// ポート番号3333でHTTPサーバーが待ち受けるように設定する
server.listen(3333, () => console.log("listening on *:3333"));
