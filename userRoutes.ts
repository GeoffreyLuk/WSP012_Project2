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

//redirects to pages
userRoutes.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'login.html'))
})
userRoutes.get('/signup', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'signup.html'))
})
userRoutes.get('/checkLoggedIn', (req, res) => {
    if (!req.session.user) {
        res.json({ logged: false })
    } else {
        res.json({
            logged: true, 'id': req.session.user['id'],
            'name': req.session.user['first_name'],
            'privilege': req.session.user.access_level,
            'icon': req.session.user.icon
        })
    }
})
userRoutes.get('/logout', (req, res) => {
    delete req.session.user
    res.redirect('/?message=succesfully+logged+out')
})
userRoutes.get('/show_details/:show_id', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'show_details.html'))
})
userRoutes.get('/editProfile', (req, res) => {
    res.sendFile(path.join(__dirname, 'protected', 'edit_profile.html'))
})
userRoutes.get('/resetPW', (req, res) => {
    res.sendFile(path.join(__dirname, 'protected', 'resetPW.html'))
})
userRoutes.get('/chatroom', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'chatroom.html'))
})
userRoutes.get('/purchase_record', (req, res) => {
    res.sendFile(path.join(__dirname, 'protected', 'purchaseRecord.html'))
})


userRoutes.get('/filter', getSelectShows)
userRoutes.post('/signup', signup)
userRoutes.post('/login', login)
userRoutes.get('/login/google', loginGoogle)
userRoutes.get('/get_user_info', getUserInfo)
userRoutes.put('/update_user_info', isLoggedInAPI, updateUserInfo)
userRoutes.put('/reset_PW', isLoggedInAPI, resetUserPW)
userRoutes.get('/get_all_shows', getAllShows)
userRoutes.get('/get_details/:show_id', getShowDetails)
userRoutes.post('/show_details/:show_id', likedShow)
userRoutes.get('/get_purchased_tickets/:user_id', getPurchasedTickets)

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

async function getPurchasedTickets(req: express.Request, res: express.Response) {
    let userId = req.params.user_id
    console.log("userId: ", userId);
    let purchasedTickets = (await client.query(
        `
        select users_purchases.id as purchaseRecord_id, purchase_date, quantity ,pricing, organiser_name, show_name, show_date,venue
        from users_purchases
        inner join tickets
        	on tickets.id = users_purchases.ticket_id 
        inner join shows
        	on shows.id = tickets.show_id 
        inner join organiser_list
        	on shows.organiser_id = organiser_list.id 
        inner join shows_locations
        	on shows_locations.show_id = shows.id
        inner join locations
        	on locations.id = shows_locations.location_id 
        where users_purchases.user_id = $1`,
        [userId]
    )).rows
    console.log("purchasedTickets: ", purchasedTickets);
    res.json({
        data: purchasedTickets,
        message: "get purchased tickets success"
    })
}


//Geoffrey Show Details

async function getShowDetails(req: express.Request, res: express.Response) {
    const targetShow = req.params.show_id.split('_').pop()
    console.log('target : ', targetShow)
    let showDetails = await (await client.query(`select shows.show_name, shows.published, shows.category_id as category, shows.details, shows.launch_date , shows.end_date, shows.created_at , shows.updated_at , shows.organiser_id ,  locations.venue , locations.address , shows_locations.show_id from
    shows_locations 
    left join shows
    on shows_locations.show_id = shows.id
	left join locations
    on shows_locations.location_id = locations.id
    where shows.id = ($1)`, [targetShow])).rows[0]
    let organiserDetails = await (await client.query(`select user_id , organiser_name from organiser_list where id = ($1)`, [showDetails['organiser_id']])).rows[0]
    let pullCategories = (await client.query(`select id , category from categories`)).rows
    let allCategories = {}
    pullCategories.forEach((elem) => {
        allCategories[elem['id']] = elem['category']
    })

    if (showDetails['published'] != true) {
        if (req.session.user.id != organiserDetails['user_id']) {
            res.status(400).end('no access rights')
        } else {
            let respondingData = {}
            delete organiserDetails['user_id']
            respondingData['showDetails'] = showDetails
            respondingData['allCategories'] = allCategories
            respondingData['organiserDetails'] = organiserDetails
            res.status(200).json(respondingData)
        }
    } else {
        let respondingData = {}
        delete organiserDetails['user_id']
        respondingData['showDetails'] = showDetails
        respondingData['allCategories'] = allCategories
        respondingData['organiserDetails'] = organiserDetails['organiser_name']
        console.log(respondingData)
        res.status(200).json(respondingData)

    }
}

async function likedShow(req: express.Request, res: express.Response) {
    try {
        const targetShow = req.params.show_id
        const askingUser = req.session.user.id
        await client.query(`INSERT into favourites (show_id,user_id) values ($1,$2)`, [
            targetShow,
            askingUser
        ])
        let targetShowChatroom = (await client.query(`select id from chatrooms where show_id = ($1)`, [targetShow])).rows[0].id
        await client.query(`INSERT into chatroom_participants (chatroom_id,user_id) values ($1,$2)`, [targetShowChatroom, askingUser])
        res.status(200).json({ message: 'successfully regsitered' })
    } catch (e) {
        console.log(e)
        res.status(500).json({ message: `error: user not found, please login` })
    }

}

async function getAllShows(req: express.Request, res: express.Response) {
    console.log('index page get all shows received ')
    let pullCategories = (await client.query(`select id , category from categories`)).rows
    let allShows = await (await client.query(`select shows.show_name , shows.category_id as category, shows.details, shows.launch_date , shows.end_date, shows.created_at , shows.updated_at ,  locations.venue , locations.address , shows_locations.show_id from
    shows_locations 
    left join shows
    on shows_locations.show_id = shows.id
	left join locations
    on shows_locations.location_id = locations.id
    where shows.published = true
    order by show_id ASC`)).rows

    let allCategories = {}
    pullCategories.forEach((elem) => {
        allCategories[elem['id']] = elem['category']
    })
    let respondingData = {}
    respondingData['allShows'] = allShows
    respondingData['allCategories'] = allCategories
    res.status(200).json(respondingData)
}

async function getSelectShows(req: express.Request, res: express.Response) {
    console.log(req.query.category)
    let showQuery = Object(req.query.category)
    console.log(showQuery)
    let pullCategories = (await client.query(`select id , category from categories`)).rows
    let allCategories = {}
    pullCategories.forEach((elem) => {
        allCategories[elem['id']] = elem['category']
    })
    let reverseCat = {}
    pullCategories.forEach((elem) => {
        reverseCat[elem['category']] = elem['id']
    })
    console.log('category id', reverseCat[showQuery])
    let allShows = (await client.query(`select shows.show_name , shows.category_id as category, shows.details, shows.launch_date , shows.end_date, shows.created_at , shows.updated_at ,  locations.venue , locations.address , shows_locations.show_id from
    shows_locations 
    left join shows
    on shows_locations.show_id = shows.id
	left join locations
    on shows_locations.location_id = locations.id
    where shows.published = true and shows.category_id = ($1)
    order by show_id ASC`, [reverseCat[showQuery]])).rows
    console.log('all shows ', allShows)

    let respondingData = {}
    respondingData['allShows'] = allShows
    respondingData['allCategories'] = allCategories
    res.status(200).json(respondingData)
}