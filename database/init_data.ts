import dotenv from "dotenv"
// import XLSX from "xlsx"
// import path from "path"
import { Client } from "pg"

dotenv.config()
export const client = new Client({
    database: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    port: 5433
})

export async function main() {
    await client.connect()
    console.log("db is connect");
}
main()