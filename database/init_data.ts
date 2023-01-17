import dotenv from "dotenv"
// import XLSX from "xlsx"
// import path from "path"
import { Client } from "pg"

dotenv.config()
export const client = new Client({
    database: process.env.DB_NAME,
    user: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
})

async function main() {
    await client.connect()
    console.log("db is connect");

    // Wait until the data xlsx is ready
    // const wb = XLSX.readFile(path.join('database', 'data.xlsx'))
    // let userSheet = wb.Sheets['user']

    // let userData: User[] = XLSX.utils.sheet_to_json(userSheet)
    // console.table(userData)

    // await client.query('')
    await client.end()
    console.log('db is disconnected');
}

main()