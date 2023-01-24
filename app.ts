import express from "express"
import fs from 'fs'
import HTTP from 'http'
import { userRoutes } from "./userRoutes"
import { uploadDir } from "./util/formidable"
import { isLoggedIn } from "./util/guard"
import { expressSessionConfig, grantExpress } from "./util/middleware"
import path from 'path'

let app = express()
let server = new HTTP.Server(app)

app.use(express.json())
fs.mkdirSync(uploadDir, { recursive: true })

app.use(expressSessionConfig);
app.use(grantExpress as express.RequestHandler);

// Application Route
app.use(userRoutes)

//Geoffrey
app.get('/show_upload',(req,res)=>{
    console.log(req.session.user.id)
    res.sendFile(path.join(__dirname,'public','show_upload.html'))
})

// Static files
app.use(express.static('public'))
app.use(isLoggedIn, express.static('protected'))


// 404 HTML
// app.use((req, res) => {
//     res.redirect("404.html")
// })

server.listen(8080, () => {
    console.log(`server listening on http://localhost:8080`);
})