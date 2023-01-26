import crypto from 'crypto'
import express from 'express'
import fetch from 'cross-fetch'
import { roomLists, chatroomId } from './util/model'
import { client } from './database/init_data';
import { formParsePromiseforSignUp } from './util/formidable';
import { checkPassword, hashPassword } from './util/hash';
import { isLoggedInAPI } from './util/guard';
import { io } from './app';

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
userRoutes.get('/chatroom', getUserChatHistory)
userRoutes.post('/send_msg', sendMessage)
userRoutes.get('/send_msg', loadMessage)
userRoutes.post('/create_show', createShow)
userRoutes.get('/get_all_chatroom', getAllChatRoom)
userRoutes.get('/get_chatroom', getChatRoombyId)

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

async function getUserChatHistory(req: express.Request, res: express.Response) {
    console.log("HI");


}

// 2
// Get All Chatroom - 
async function getAllChatRoom(req: express.Request, res: express.Response) {
    let result = await client.query(
        `select * from chatrooms`
    )
    let roomLists: roomLists[] = result.rows
    // console.log("roomLists: ", roomLists);

    io.emit('get_all_chatroom')
    // console.log("get_all_chatroom emitted");

    res.json({
        data: roomLists,
        message: "Passed roomlists"
    })
}

// 3
// Get Chatroom By UserId - 
async function getChatRoombyId(req: express.Request, res: express.Response) {
    let chatroomIdResult = await client.query(
        `select chatroom_id from chatroom_participants where user_id = $1`,
        [req.session.user.id]
    )

    let chatroomsId: chatroomId[] = chatroomIdResult.rows.map(data => {
        return data.chatroom_id
    })
    console.log("chatroomId: ", chatroomsId);
    let chatroomNames = []
    for (let chatroomId of chatroomsId) {
        let chatroomIdResult = await client.query(
            `select chatroom_name from chatrooms where id = $1`,
            [chatroomId]
        )

        let chatroomName = chatroomIdResult.rows[0]
        // console.log("chatroomName: ", chatroomName.chatroom_name);
        chatroomNames.push({ chatroom_name: chatroomName.chatroom_name })
    }
    console.log("chatroomNames: ", chatroomNames);
    // io.emit('get_all_chatroom')
    res.json({
        data: chatroomNames,
        user: req.session.user.first_name,
        message: "Passed roomNames"
    })
}

// 1.
// Show - [POST - Create] -> create chatroom -> participant
async function createShow(req: express.Request, res: express.Response) {
    let { organiser_id, category_id, show_name, show_duration, sales_start_date, sales_end_date, published, launch_date, end_date, details } = req.body
    // console.log("req.body: ", req.body);

    // insert data to "SHOWS"
    await client.query(
        `insert into shows(organiser_id, category_id, show_name, show_duration, sales_start_date, sales_end_date, published, launch_date, end_date, details)
            values ($1, $2, $3, $4, $5, $6, $7, $8, $9,$10)`,
        [organiser_id, category_id, show_name, show_duration, sales_start_date, sales_end_date, published, launch_date, end_date, details]
    )

    // get show_id from query
    let show_id = await client.query(
        `select id from shows where show_name = $1`,
        [show_name]
    )
    // console.log("show_id: ", show_id.rows[0]);

    // insert data to "Chatrooms"
    await client.query(
        `insert into chatrooms(chatroom_name, show_id)
            values ($1, $2)`,
        [show_name, show_id.rows[0].id]
    )
    // console.log("Inserted to Chatroom ");

    // get chatroom id from query
    let chatroom_id = await client.query(
        `select id from chatrooms where show_id = $1`,
        [show_id.rows[0].id]
    )
    // console.log("chatroom_id: ", show_id.rows[0].id);

    // get user_id from query
    let user_id = await client.query(
        `select user_id from organiser_list where id = $1`,
        [organiser_id]
    )
    // console.log("user_id", user_id.rows[0].user_id);

    // insert data to "chatroom_participants"
    await client.query(
        `insert into chatroom_participants(chatroom_id, user_id)
            values($1, $2)`,
        [chatroom_id.rows[0].id, user_id.rows[0].user_id]
    )
    // socket.join('join_new_show')
    // io.emit('join_new_show')
    console.log("insert data to chatroom participants");

    res.json({
        roomName: "room_" + show_name,
        userName: "Gary",
    })

}

// Get the conversation history from table (Not yet done)
// Need to connect with database to download data
async function loadMessage(req: express.Request, res: express.Response) {
    let result = "test"
    console.log("Result:", result);

    res.json({
        text: result
    })
}

// upload text to database
async function sendMessage(req: express.Request, res: express.Response) {
    console.log("Send Message");
    let { message } = req.body
    console.log("message: ", message);
    io.emit("new_msg")
    res.json({
        message: "Success"
    })
}