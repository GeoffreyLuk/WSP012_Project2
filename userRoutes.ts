import crypto from 'crypto'
import express from 'express'
import fetch from 'cross-fetch'
import { client } from './database/init_data';
import { formParsePromiseforSignUp } from './util/formidable';
import { checkPassword, hashPassword } from './util/hash';
import { isLoggedInAPI } from './util/guard';
export const userRoutes = express.Router()


declare module "express-session" {
    interface SessionData {
        id?: number;
        user?: any;
    }
}

userRoutes.post('/signup', signup)
userRoutes.post('/login', login)
userRoutes.get('/login/google', loginGoogle)
userRoutes.get('/get_user_info', getUserInfo)
userRoutes.put('/update_user_info', isLoggedInAPI, updateUserInfo)

async function signup(req: express.Request, res: express.Response) {
    try {
        console.log("ABD");

        let { fields, files } = await formParsePromiseforSignUp(req)
        // Haven't test

        let fileName = files.originalFilename ? files.newFilename : ''
        // console.log('files.image: ', files.image); 
        // console.log('fileName:', fileName);

        // Hashpassword
        let hashedpassword = await hashPassword(fields.password)

        let selectUserResult = await client.query(
            `select * from users where email = $1`,
            [fields.email]
        )

        let foundUser = selectUserResult.rows[0]

        if (foundUser) {
            res.status(402).json({
                message: 'Email already register, please use another email.'
            })
            return
        }
        await client.query(
            `insert into users(first_name, last_name, email, phone_number, icon, password, last_online)
            values ($1,$2,$3,$4,$5,$6,now())`,
            [fields.first_name, fields.last_name, fields.email, fields.phone_number, fileName, hashedpassword]
        )

        res.json({
            message: 'Register Successfully'
        })
        console.log('Register Successfully!');

        // redirect(?)
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: '[USR001] - Server error'
        })
    }

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

        req.session.user = foundUser
        // console.log(foundUser);
        res.json({
            data: foundUser,
            message: "Login Successfully"
        })
        // res.redirect('/edit_profile.html')
        console.log("Login Successfully");
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: '[USR002] - Server Error'
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
                    `INSERT INTO users (first_name, last_name, email, password, last_online) values ($1,$2,$3,$4,now()) RETURNING *`,
                    [googleUserProfile.given_name, googleUserProfile.family_name, googleUserProfile.email, hashedPassword]
                )
            ).rows[0]
        }

        delete foundUser.password
        req.session['user'] = foundUser
        // Need to amend in future
        return res.redirect('/edit_profile.html')
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: '[USR003] - Server error'
        })
    }
}

async function getUserInfo(req: express.Request, res: express.Response) {
    res.json(req.session.user || {})
}

async function updateUserInfo(req: express.Request, res: express.Response) {
    try {
        let { email, firstName, lastName, phoneNumber } = req.body
        let selectedUserResult = await client.query(
            `select * from users where email =$1`, [req.session.user?.email]
        )

        let foundUser = selectedUserResult.rows[0]
        console.log(foundUser);

        await client.query(
            `UPDATE users SET first_name = $1, last_name =$2, phone_number=$3, email=$4 where id  = $5 `,
            [firstName, lastName, phoneNumber, email, foundUser.id]
        )
        req.session.user = foundUser
        res.json({
            data: foundUser,
            message: 'Update Info Success'
        })
        // Get new user data

    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: '[USR004] - Server error'
        })
    }
}