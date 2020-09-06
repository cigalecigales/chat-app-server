export interface User {
  name: string;
  socketId: string;
}

export interface Log {
  logId: number;
  userName: string;
  time: string;
  message: string;
}

export interface Room {
  id: string;
  name: string;
  users: User[];
  logs: Log[];
}

const rooms: Room[] = [{
  id: 'DEFAULT_ROOM',
  name: '雑談',
  users: [],
  logs: []
}];

export default rooms;
