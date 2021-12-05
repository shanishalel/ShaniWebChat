const path=require('path');
const http= require('http');
const express=require('express');
const socketio=require('socket.io');


const app = express();
const server= http.createServer(app);
const io=socketio(server);
const formatMessage=require('./utils/messages');
const {userJoin, getCurrentUser, userLeave, getRoomUsers}=require('./utils/user');


//set static folder
app.use(express.static(path.join(__dirname,'public')));

const botName='shani Webchat bot';
//run wen client connects
io.on('connection',socket => {

    socket.on('joinRoom',({username,room})=>{
        const user=userJoin(socket.id,username,room);
        socket.join(user.room);

        socket.emit('message',formatMessage(botName,'Welcome to Shani ChatWeb ! '));

        //broadcast when user connets
        socket.broadcast
        .to(user.room)
        .emit(
            'message',
            formatMessage( botName, `${user.username} has joined the chat`));
            
            //Send users and room information
            io.to(user.room).emit('roomUsers',{
                room:user.room,
                users :getRoomUsers(user.room)
            });


    });
    
    //listen for chatmessage
    socket.on('chatMessage',(msg)=>{
        const user=getCurrentUser(socket.id);

        
        //emit to everybody
        io.to(user.room).emit('message',
        formatMessage(user.username,msg));
    });

    //runs when client disconnets
    socket.on('disconnect',()=>{
    const user=userLeave(socket.id);

    if(user){
        io.to(user.room).emit('message',
        formatMessage(botName,` ${user.username} has left the chat`)); // everyone will gets the message that the user left 
    

          //Send users and room information
          io.to(user.room).emit('roomUsers',{
            room:user.room,
            users :getRoomUsers(user.room)
        });


    }
});

        


});

const PORT=5000 || process.env.PORT;
server.listen(PORT,() => console.log(`Server running on port ${PORT}`));
