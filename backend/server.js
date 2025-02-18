const express = require("express");
const dotenv = require("dotenv");
const connectDB=require("./config/db")
const userRoutes=require('./routes/userRoutes')
const chatRoutes=require('./routes/chatRoutes')
const messageRoutes=require('./routes/messageRoutes')
const app = express();
const {notFound, errorHandler}=require('./middleware/errorMiddleware')
dotenv.config();
connectDB()
app.use(express.json()); 
app.get("/", (req, res) => {
  res.send("App is running succesfully..wow");
});

app.use('/api/user',userRoutes)
app.use('/api/chat', chatRoutes)
app.use('/api/message', messageRoutes)
app.use(notFound)
app.use(errorHandler)

const port = process.env.PORT || 5000;
const server=app.listen(port, console.log(`Server started on ${port}`));
const io= require('socket.io')(server,{
  pingTimeout:60000,
  cors:{
    origin:"http://localhost:3000"
  }
}
)
io.on('connection',(socket)=>{
  console.log("connected to socket.io")

  socket.on("setup",(userData)=>{
    console.log(userData._id)
    console.log("SS")
    socket.join(userData._id);
    socket.emit("connected")
  })
  socket.on("join chat",(room)=>{
    socket.join(room)
    console.log("ROOM "+room)
  })

  socket.on("new message",(newMessageRecieved)=>{
    var chat=newMessageRecieved.chat;
    if(!chat.users) return
    console.log(newMessageRecieved)
    console.log("tatti")
    chat.users.forEach(user=>{
      if(user._id==newMessageRecieved.sender._id) return
      
      socket.in(user._id).emit("message recieved")
    })
  })
})