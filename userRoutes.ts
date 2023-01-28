import crypto from 'crypto'
import express from 'express'
import fetch from 'cross-fetch'
import { client } from './database/init_data';
import { formParsePromiseforSignUp } from './util/formidable';
import { checkPassword, hashPassword } from './util/hash';
import { isLoggedInAPI } from './util/guard';
import path from 'path'

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
userRoutes.put('/reset_PW', isLoggedInAPI, resetUserPW)
userRoutes.get('/show_details/:show_id',(req,res)=>{
    res.sendFile(path.join(__dirname,'public','show_details.html'))
})
userRoutes.get('/get_details/:show_id', getShowDetails)
userRoutes.post('/show_details/:show_id', likedShow)

async function signup(req: express.Request, res: express.Response) {
    try {
        let { fields, files } = await formParsePromiseforSignUp(req)
        // Haven't test

        let fileName = files.originalFilename ? files.newFilename : ''

        // Hashpassword
        let hashedPassword = await hashPassword(fields.password)

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
            [fields.first_name, fields.last_name, fields.email, fields.phone_number, fileName, hashedPassword]
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
        delete foundUser.password
        req.session.user = foundUser

        res.json({
            data: foundUser,
            // name: foundUser.first_name,
            message: "Login Successfully"
        })

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
        return res.redirect('/')
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
        let { newEmail, email, firstName, lastName, phoneNumber } = req.body

        let selectedUserResult = await client.query(
            `select * from users where email = $1`, [req.session.user?.email]
        )
        let selectedNewEmailResult = await client.query(
            `select * from users where email = $1`, [newEmail]
        )

        let NewEmailUserExist = selectedNewEmailResult.rows[0]

        if (NewEmailUserExist) {
            res.status(402).json({
                message: 'Email already register, please use another email.'
            })
            return
        }
        await client.query(
            `UPDATE users SET first_name = $1, last_name =$2, phone_number=$3, email=$4 where id  = $5 `,
            [firstName, lastName, phoneNumber, email, req.session.user?.id]
        )

        selectedUserResult = await client.query(
            `select * from users where email = $1`, [email]
        )

        let foundUser = selectedUserResult.rows[0]
        delete foundUser.password
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

async function resetUserPW(req: express.Request, res: express.Response) {
    try {
        let { oldPassword, newPassword } = req.body
        let selectedUserResult = await client.query(
            `select * from users where email = $1`, [req.session.user?.email]
        )

        let foundUser = selectedUserResult.rows[0]

        let validatePassword = await checkPassword(oldPassword, foundUser.password)
        if (!validatePassword) {
            res.status(402).json({
                message: "Wrong password, please try again."
            })
            return
        }

        let hashedPassword = await hashPassword(newPassword)

        await client.query(
            `UPDATE users SET password = $1 where id = $2`,
            [hashedPassword, foundUser.id]
        )

        delete foundUser.password

        req.session.user = foundUser
        console.log("Reset successfully");

        res.json({
            data: foundUser,
            message: 'Reset Password Success'
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: '[USR005] - Server error'
        })
    }
}

//Geoffrey Show Details

async function getShowDetails(req: express.Request, res: express.Response) {
    const targetShow = req.params.show_id
    console.log ('target : ',targetShow)
    let returningShow = await client.query(`select shows.* , organiser_list.user_id from
    shows left outer join organiser_list
    on organiser_list.id = shows.organiser_id
    where  shows.id = ($1)`, [targetShow])
    let returningShowResults = returningShow.rows[0]
    if (returningShowResults['published'] != true) {
        if (req.session.user != returningShowResults['user_id']) {
            res.status(400).end('no access rights')
        } else {
            delete returningShowResults['user_id']
            res.status(200).json(returningShowResults)
        }
    }else {
        delete returningShowResults['user_id']
        res.status(200).json(returningShowResults)
    }
}

async function likedShow(req: express.Request, res: express.Response) {
    const targetShow = req.params.show_id
    const askingUser = req.body.user
    let returningShow = await client.query(`select * from favourites where show_id = ${1} and user_id =${2}`, [targetShow, askingUser])
    let returningShowResults = returningShow.rows[0]
    if (!returningShowResults) {
        // await client.query(/*post*/)
    } else {
        // await client.query(/*drop*/)
    }
}