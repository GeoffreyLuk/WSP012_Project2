import crypto, { randomBytes } from 'crypto'
import express from 'express'
import fetch from 'cross-fetch'
import { client } from './database/init_data';
import { formParsePromise } from './util/formidable';
import { checkPassword, hashPassword } from './util/hash';
export const userRoutes = express.Router()

userRoutes.post('/signup', signup)
userRoutes.post('/login', login)
userRoutes.get('/login/google', loginGoogle)

// Need try catch
async function signup(req: express.Request, res: express.Response) {
    let { fields, files } = await formParsePromise(req)

    // Haven't test
    let fileName = files.image ? files.image['newFilename'] : ''
    // Check if the account has already register or not
    // Hashpassword
    let hashedpassword = await hashPassword(fields.password)
    console.log(hashedpassword);

    await client.query(
        `insert into users(first_name, last_name, email, phone_number, icon, password, last_online,created_at, updated_at)
        values ($1,$2,$3,$4,$5,$6,now(),now(),now())`,
        [fields.first_name, fields.last_name, fields.email, fields.phone_number, fileName, hashedpassword]
    )

    res.json({
        message: 'Register Successfully'
    })

    // if (!email || !password) {
    //     res.status(402).json({
    //         message: 'Invalid input'
    //     })
    //     return;
    // }

    // let selectUserResult = await client.query(
    //     `select * from users where email = $1`,
    //     [email]
    // )

    // let foundUser = selectUserResult.rows[0]

    // if (!foundUser) {
    // }
}

async function login(req: express.Request, res: express.Response) {
    try {
        let { email, password } = req.body
        if (!email || !password) {
            res.status(402).json({
                message: "Invalid Email/ Password. Please try again."
            })
            return
        }

        let selectedUserResult = await client.query(
            `select * from users where email = $1`, [email]
        )

        let foundUser = selectedUserResult.rows[0];
        if (!foundUser) {
            res.status(402).json({
                message: "Current email hasn't register, please sign up first."
            })
            return
        }

        let validatePassword = await checkPassword(password, foundUser.password)
        if (!validatePassword) {
            res.status(402).json({
                message: "Wrong password, please try again."
            })
            return
        }
        console.log("Login Successfully");
    } catch (err) {
        res.status(500).json({
            message: '[USR001] - Server Error'
        })
    }


}

async function loginGoogle(req: express.Request, res: express.Response) {
    try {
        const accessToken = req.session?.['grant'].response.access_token

        const fetchRes = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
            method: "get",
            headers: {
                "Authorization": `Bearer ${accessToken}`
            }
        });

        const googleUserProfile = await fetchRes.json();
        let foundUser = (await client.query(`SELECT * FROM users WHERE users.email = $1`, [googleUserProfile.email])).rows[0];

        if (!foundUser) {
            let hashedPassword = await hashPassword(crypto.randomUUID())
            foundUser = (
                await client.query(
                    `INSERT INTO users (first_name, last_name, email, phone_number, password, last_online) values ($1,$2,$3,$4,$5,now()) RETURNING *`,
                    [googleUserProfile.given_name, googleUserProfile.family_name, googleUserProfile.email, 97056799, hashedPassword]
                )
            ).rows[0]
        }

        delete foundUser.password
        if (req.session) {
            req.session['user'] = {
                id: foundUser.id
            }
        }
        // Need to amend in future
        return res.redirect('/login.html')
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: '[USR002] - Server error'
        })
    }
}