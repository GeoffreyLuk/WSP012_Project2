import express from "express"
import { client } from './database/init_data';
import { chatroomId } from './util/model'
import { io } from './app';
import { formParsePromiseforPhoto } from "./util/formidable";
import path from "path";


export const chatroomRoutes = express.Router()

chatroomRoutes.post('/create_show', createShow)
chatroomRoutes.get('/get_chatroom', getChatRoomById)
chatroomRoutes.get('/get-chat-history/:chatroom_id', getChatHistoryById)
chatroomRoutes.post('/send_msg', sendMessage)
chatroomRoutes.post('/send_img', uploadPhoto)

// Get conversation from database
async function getChatHistoryById(req: express.Request, res: express.Response) {
    try {
        // Need to grab user_name as
        let roomId = req.params.chatroom_id
        // console.log("backend - roomId: ", roomId);
        let result = await client.query(
            `select chatroom_id, content_type ,content, message_time, first_name, user_id from chatroom_messages 
                inner join users on users.id = user_id
                where chatroom_id = $1
                order by message_time asc`,
            [roomId]
        )

        let messages = result.rows

        for (let messageItem of messages) {
            if (messageItem.user_id == req.session.user.id) {
                messageItem["toMessage"] = true
            } else {
                messageItem["toMessage"] = false
            }
        }

        console.log("get chat history - messages: ", messages);
        if (!messages) {
            console.log("No message.");
        }

        res.json({
            data: messages,
            message: "Load messages success"
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: '[CHR001] - Server error'
        })
    }

}

// Get Chatroom By UserId - 
async function getChatRoomById(req: express.Request, res: express.Response) {
    try {
        // Search chatroom_id in chatroom_participants by user_id
        let chatroomIdResult = await client.query(
            `select chatroom_id from chatroom_participants where user_id = $1`,
            [req.session.user.id]
        )
        // Map the chatroom id
        let chatroomsId: chatroomId[] = chatroomIdResult.rows.map(data => {
            return data.chatroom_id
        })

        let chatrooms: {
            chatroom_name: string,
            chatroom_id: number
        }[] = []
        // Search each chatroomName by chatroom id
        for (let chatroomId of chatroomsId) {
            let chatroomIdResult = await client.query(
                `select * from chatrooms where id = $1`,
                [chatroomId]
            )

            let chatroomResult = chatroomIdResult.rows[0]

            chatrooms.push({ chatroom_name: chatroomResult.chatroom_name, chatroom_id: chatroomResult.id })
        }

        res.json({
            data: chatrooms,
            message: "Passed roomNames"
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: '[CHR002] - Server error'
        })
    }
}

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
    res.json({
        roomId: "room_" + chatroom_id.rows[0].id,
    })

}

// Send Msg function
async function sendMessage(req: express.Request, res: express.Response) {
    try {
        console.log("Send Message");
        let { chatroom_id, text } = req.body

        let msg_time = Date.now()
        // upload data to chatroom_messages
        await client.query(
            `
        insert into chatroom_messages(chatroom_id, user_id, content_type, content, message_time) 
        values ($1, $2, $3, $4, now())`,
            [chatroom_id, req.session.user.id, 0, text]
        )
        let data = { text, chatroom_id, user_id: req.session.user.id, user_name: req.session.user.first_name, msg_time }

        io.to("room_" + chatroom_id).emit('new_msg', data)

        res.json({
            data: data,
            message: "Success"
        })
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: '[CHR003] - Server error'
        })
    }
}

// Upload Photo function
async function uploadPhoto(req: express.Request, res: express.Response) {
    try {
        let { fields, files } = await formParsePromiseforPhoto(req)

        let fileName = files.image ? files.image['newFilename'] : ''
        console.log("fields: ", fields);
        let folderPath = './assets/message_picture'
        let filePath = path.join(folderPath, fileName)
        console.log("fields.room_id: ", fields.room_id);
        console.log("fileName: ", fileName);
        console.log("filePath: ", filePath);

        await client.query(
            `insert into chatroom_messages(chatroom_id, user_id, content_type, content, message_time) 
            values ($1, $2, $3, $4, now())`,
            [fields.room_id, req.session.user.id, 1, filePath]
        )
        let data = { chatroom_id: fields.room_id }

        io.to("room_" + fields.room_id).emit('new_msg', data)

        res.json({
            message: "Uploaded image"
        })
        console.log("Done Uploading Image");
    } catch (err) {
        console.log(err);
        res.status(500).json({
            message: '[CHR004] - Server error'
        })
    }

}