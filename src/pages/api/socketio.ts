import { Server } from 'socket.io'

const ioHandler = (req, res) => {
  if (!res.socket.server.io) {
    console.log('*First use, starting socket.io')

    const io = new Server(res.socket.server)

    io.on('connection', socket => {
      socket.broadcast.emit('a user connected')

      socket.on('hello', roomId => {
        console.log(`joined ${roomId}`)
        socket.join(roomId);
        socket.to(roomId).emit('say', 'new person joined! say hello.')
      });

      socket.on('say', ({ message, timestamp }, roomId) => {
        console.log(`said "${message}" to ${roomId}`);
        socket.to(roomId).emit('say', { message, timestamp });
      });

    })

    res.socket.server.io = io
  } else {
    console.log('socket.io already running')
  }
  res.end()
}

export const config = {
  api: {
    bodyParser: false
  }
}

export default ioHandler