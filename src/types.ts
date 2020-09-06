import { User, Log, Room } from './rooms';

interface ResultCommon {
  type: string;
}

/**
 * チャットルーム作成
 */
export interface CreateRoom {
  roomName: string;
  userName: string;
}
/**
 * チャットルーム作成（結果）
 */
export interface CreateRoomResult extends ResultCommon {
  rooms: Room[]
}

/**
 * チャットルームに参加
 */
export interface JoinRoom {
  roomId: string;
  userName: string;
}
/**
 * チャットルームに参加（結果）
 */
export interface JoinRoomResult extends ResultCommon {
  roomId: string;
  userName: string;
  users: User[]
}

/**
 * チャット
 */
export interface Conversation {
  roomId: string;
  userName: string;
  message: string;
}
/**
 * チャット（結果）
 */
export interface ConversationResult extends ResultCommon {
  roomId: string;
  userName: string;
  time: string;
  message: string;
}

/**
 * チャットルーム退室（結果）
 */
export interface DisconnectRoomResult extends ResultCommon {
  roomId: string;
  socketId: string;
}

/**
 * 現在のチャットルーム
 */
export interface CurrentRoom {
  roomId: string;
}

/**
 * 現在のチャットルーム（結果）
 */
export interface CurrentRoomResult extends ResultCommon {
  roomId: string;
  roomName: string;
  users: User[],
  logs: Log[]
}
