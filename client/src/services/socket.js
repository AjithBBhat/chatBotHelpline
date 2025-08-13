// client/src/services/socket.js
import io from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    this.socket = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
      auth: { token }
    });

    this.socket.on('connect', () => {
      console.log('Connected to server');
    });

    this.socket.on('disconnect', () => {
      console.log('Disconnected from server');
    });

    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  sendMessage(data) {
    if (this.socket) {
      this.socket.emit('send_message', data);
    }
  }

  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('new_message', callback);
    }
  }

  joinRooms(conversationIds) {
    if (this.socket) {
      this.socket.emit('join_rooms', conversationIds);
    }
  }
}

export default new SocketService();
