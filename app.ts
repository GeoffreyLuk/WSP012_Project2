import express from "express"
import pg from "pg"
import HTTP from 'http'
import { env } from './util/env'

const client = new pg.Client({
    database: env.DB_NAME,
    user: env.DB_USERNAME,
    password: env.DB_PASSWORD
})

client.connect()

let app = express()
let server = new HTTP.Server(app)

app.use(express.urlencoded({ extended: true }))
app.use(express.json())

app.use(express.static('public'))

app.use((req, res) => {
    res.redirect("404.html")
})

server.listen(8080, () => {
    console.log(`server listening on http://localhost:8080`);
})