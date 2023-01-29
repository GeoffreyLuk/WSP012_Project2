import express from "express"
import fs from 'fs'
import http from 'http'
import { Server as SocketIO } from "socket.io"
import { userRoutes } from "./userRoutes"
import { organiserRoutes } from "./organiserRoutes"
import { selectTicketRoutes } from "./selectTicketsRoutes"
import { uploadDir } from "./util/formidable"
import { isLoggedIn } from "./util/guard"
import { sessionMiddleware, grantExpress } from "./util/middleware"
import { chatroomRoutes } from "./chatroomRoutes"
import { client } from './database/init_data';
import { roomLists, chatroomId } from './util/model'
import { shoppingCartRoutes } from "./shoppingCartRoutes"

let app = express()
let server = new http.Server(app)
export const io = new SocketIO(server)

app.use(sessionMiddleware);
app.use(grantExpress as express.RequestHandler);
app.use(express.json())
fs.mkdirSync(uploadDir, { recursive: true })

// io setup
io.use((socket, next) => {
    let req = socket.request as express.Request;
    let res = req.res as express.Response;
    sessionMiddleware(req, res, next as express.NextFunction);
});

// Application Route
app.use(userRoutes)
app.use(chatroomRoutes)
app.use(selectTicketRoutes)
app.use(shoppingCartRoutes)

//Geoffrey
app.use(organiserRoutes)

// Static files
app.use(express.static('public'))
app.use(isLoggedIn, express.static('protected'))

io.on("connection", function (socket) {
    console.log('socket connected: ', socket.id);
    // console.log("Connection Start");

    const req = socket.request as express.Request;


    if (req.session.user) {
        // console.log(req.session.user);
        // If Organizer -> get show list -> create room for organizer

        // Join all show room
        // let roomName = ("user-" + req.session.user.id)
        // Hardcode
        // socket.join("UserID")
        // // console.log(`已安排 ${req.session.user.first_name} 進入 Room :Test.`);
        // io.to("Test").emit('greeting', `${req.session["user"].name} welcome to Room!`)
        socket.request["session"].save()
    }


    const user = req.session.user
    const userId = user.id
    const username = user.first_name

    socket.on('join_all_chatroom', async () => {
        // Search chatroom_id in chatroom_participants by user_id
        let chatroomIdResult = await client.query(
            `select chatroom_id from chatroom_participants where user_id = $1`,
            [userId]
        )
        // Map the chatroom id
        let chatroomsId: chatroomId[] = chatroomIdResult.rows.map(data => {
            return data.chatroom_id
        })

        // console.log("chatroomId: ", chatroomsId);
        let chatrooms: {
            chatroom_name: string,
            chatroom_id: number
        }[] = []
        // Search each chatroomName by chatroom id
        for (let chatroomId of chatroomsId) {
            let chatroomIdResult = await client.query(
                `select * from chatrooms where id = $1`,
                [chatroomId]
            )

            let chatroomResult = chatroomIdResult.rows[0]
            // console.log("chatroomResult: ", chatroomResult);

            chatrooms.push({ chatroom_name: chatroomResult.chatroom_name, chatroom_id: chatroomResult.id })
        }

        for (let chatroom of chatrooms) {
            socket.join(String("room_" + chatroom.chatroom_id))
            console.log(`${username} joined Room ${chatroom.chatroom_id}`);
        }
    })

    socket.on('join_chatroom', (roomId) => {

        let chatroom = "room_" + roomId
        socket.join(chatroom)
        console.log(`${username} joined Room ${chatroom}`);
    })

    // Listen - join showroom when created show
    socket.on("join_new_room", ([roomId]) => {
        let chatroom = "room_" + roomId
        // // const user = getCurrentUser(socket.id);
        socket.join(chatroom)
        console.log(`${username} joined Room ${chatroom}`);
        // io.to(user.room).emit("message", formatMessage(user.username, msg));
    });

});


// socket.io('join_new_show')
// app.get('/', (req, res) => {

//     res.end('ok')
// })

// 404 HTML
// app.use((req, res) => {
//     res.redirect("404.html")
// })

server.listen(8080, () => {
    console.log(`server listening on http://localhost:8080`);
})