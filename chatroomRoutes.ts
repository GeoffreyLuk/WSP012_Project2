import express from "express"
import { client } from './database/init_data';
import { roomLists, chatroomId } from './util/model'
import { io } from './app';

export const chatroomRoutes = express.Router()

chatroomRoutes.post('/create_show', createShow)
chatroomRoutes.get('/get_all_chatroom', getAllChatRoom)
chatroomRoutes.get('/get_chatroom', getChatRoomById)
chatroomRoutes.get('/get-chat-history/:chatroom_id', getChatHistoryById)
chatroomRoutes.get('/chatroom', getUserChatHistory)
chatroomRoutes.post('/send_msg', sendMessage)
chatroomRoutes.get('/send_msg', loadMessage)

async function getUserChatHistory(req: express.Request, res: express.Response) {
    console.log("HI");


}

async function getChatHistoryById(req: express.Request, res: express.Response) {
    // Need to grab user_name as
    let roomId = req.params.chatroom_id
    console.log("roomId: ", roomId);
    let result = await client.query(
        `select * from chatroom_messages where chatroom_id = $1`,
        [roomId]
    )

    let messages = result.rows[0]
    console.log("messages: ", messages);

    res.json({
        data: messages,
        message: "Load messages success"
    })

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
async function getChatRoomById(req: express.Request, res: express.Response) {
    // Search chatroom_id in chatroom_participants by user_id
    let chatroomIdResult = await client.query(
        `select chatroom_id from chatroom_participants where user_id = $1`,
        [req.session.user.id]
    )
    // Map the chatroom id
    let chatroomsId: chatroomId[] = chatroomIdResult.rows.map(data => {
        return data.chatroom_id
    })

    console.log("chatroomId: ", chatroomsId);
    let chatrooms = []
    // Search each chatroomName by chatroom id
    for (let chatroomId of chatroomsId) {
        let chatroomIdResult = await client.query(
            `select * from chatrooms where id = $1`,
            [chatroomId]
        )

        let chatroomResult = chatroomIdResult.rows[0]
        console.log("chatroomResult: ", chatroomResult);

        chatrooms.push({ chatroom_name: chatroomResult.chatroom_name, chatroom_id: chatroomResult.id })
    }
    console.log("chatrooms: ", chatrooms);
    res.json({
        data: chatrooms,
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
        roomId: "room_" + chatroom_id.rows[0].id,
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
    let { chatroom_id, text } = req.body

    console.log("message: ", text);
    console.log("chatroom_id: ", chatroom_id);
    console.log("user_id: ", req.session.user.id);

    // upload data to chatroom_messages
    await client.query(
        `
        insert into chatroom_messages(chatroom_id, user_id, content_type, content, message_time) 
        values ($1, $2, $3, $4, now())`,
        [chatroom_id, req.session.user.id, 0, text]
    )
    let data = { text, chatroom_id, user_id: req.session.user.id }
    io.to("room_" + chatroom_id).emit('new_msg')
    res.json({
        message: "Success"
    })
}