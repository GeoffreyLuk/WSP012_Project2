import express from "express"
import fs from 'fs'
import http from 'http'
import { Server as SocketIO } from "socket.io"
import { userRoutes } from "./userRoutes"
import { organiserRoutes } from "./organiserRoutes"
import { uploadDir } from "./util/formidable"
import { isLoggedIn } from "./util/guard"
import { sessionMiddleware, grantExpress } from "./util/middleware"
import { chatroomRoutes } from "./chatroomRoutes"

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

//Geoffrey
app.use(organiserRoutes)

// Static files
app.use(express.static('public'))
app.use(isLoggedIn, express.static('protected'))

io.on("connection", function (socket) {
    console.log('socket connected: ', socket.id);
    // console.log("Connection Start");

    const req = socket.request as express.Request;
    // console.log("req.session.user: ", req.session.user);


    if (req.session.user) {
        // console.log(req.session.user);
        // If Organizer -> get show list -> create room for organizer

        // Join all show room
        // let roomName = ("user-" + req.session.user.id)
        // Hardcode
        socket.join("UserID")
        // console.log(`已安排 ${req.session.user.first_name} 進入 Room :Test.`);
        io.to("Test").emit('greeting', `${req.session["user"].name} welcome to Room!`)
        socket.request["session"].save()
    }
    // console.log("req.session.user: ", req.session["user"])

    socket.on('join_chatroom', (roomId) => {
        let chatroom = "room_" + roomId
        socket.join(chatroom)
        console.log(`joined Room ${chatroom}`);
    })

    // Listen - join showroom when created show
    socket.on("join_new_room", ([roomId]) => {
        console.log("roomID: ", roomId);

        // const user = getCurrentUser(socket.id);
        socket.join(roomId)
        console.log(`joined Room: ${roomId}`);

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