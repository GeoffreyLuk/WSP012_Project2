import express from "express"
import fs from 'fs'
import http from 'http'
import { Server as SocketIO } from "socket.io"
import { userRoutes } from "./userRoutes"
import { uploadDir } from "./util/formidable"
import { isLoggedIn } from "./util/guard"
import { sessionMiddleware, grantExpress } from "./util/middleware"

let app = express()
let server = new http.Server(app)
const io = new SocketIO(server)

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

// Static files
app.use(express.static('public'))
app.use(isLoggedIn, express.static('protected'))

io.on("connection", function (socket) {
    const req = socket.request as express.Request;
    console.log('socket connected: ', socket.id);

    // Problem: still work while not signing in
    if (req.session.user) {
        let roomName = ("user-" + req.session.user.id)
        socket.join(roomName)
        req.session["user"] = {
            roomName: roomName,
            name: req.session.user.first_name
        }
        // console.log('user info: ', req.session.user);
        console.log(`已安排 ${socket.id} 進入 Room :${roomName}.`);
        io.to(roomName).emit('greeting', `${req.session["user"].name} welcome to Room: ${roomName}!`)
    }
    socket.request["session"].save()
    console.log(req.session["user"])
});

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