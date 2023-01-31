let room_id
const socket = io();

let messagesElem = document.querySelector('#messages-box');
let form = document.querySelector('#form');
let input = document.querySelector('#input');
// let showForm = document.querySelector('#show-form')
let roomListElem = document.querySelector('.room-list')
let uploadPhoto = document.querySelector('#uploadImage')

// Send Msg
form.addEventListener('submit', async (e) => {
    e.preventDefault();

    console.log("submit")
    if (input.value != "") {
        let msgData = {
            chatroom_id: room_id,
            text: input.value
        }
        console.log("msgData: ", msgData);
        let res = await fetch('/send_msg', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(msgData)
        })
        form.reset()
        // if (!res.ok) {
        //     return
        // }

        let data = await res.json()
        console.log("Send message data: ", data);
        console.log("sent");
    } else {
        return
    }
});

// // Create show
// showForm.addEventListener('submit', async (e) => {
//     e.preventDefault();
//     console.log("show form start");
//     let showData = {
//         organiser_id: 1,
//         category_id: 1,
//         show_name: 'test',
//         show_duration: 120,
//         sales_start_date: '2022-01-01',
//         sales_end_date: '2022-02-01',
//         published: false,
//         launch_date: '2022-06-01',
//         end_date: '2022-07-01',
//         details: {
//             "text": "I go to school by bus"
//         },
//     }
//     console.log("about to send showData");
//     let res = await fetch('/create_show', {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json'
//         },
//         body: JSON.stringify(showData)
//     })
//     console.log("Got res");
//     let data = await res.json()
//     socket.emit('join_new_room', [data.roomId])
// })

// Upload Photo in chatroom
uploadPhoto.addEventListener('submit', async (e) => {
    e.preventDefault()
    let i = document.querySelector('#fileget')
    if (!i.files[0].name){
        return
    }else{
        
        console.log("Upload start");
        let uploadData = new FormData(uploadPhoto)
    
        
        uploadData.append("room_id", room_id)
        let res = await fetch('/send_img', {
            method: 'POST',
            body: uploadData
        })
    
        if (res.ok) {
            uploadPhoto.reset()
            return
        } else {
            console.log("Upload photo failed.");
        }
    
        let data = res.json()
        console.log("uploadPhoto - data: ", data.data);
    }
    return
})

async function loadAllChatroom() {
    let res = await fetch('/get_chatroom')
    if (res.ok) {
        let data = await res.json()
        let roomLists = data.data
        console.log("roomLists: ", roomLists);
        updateChatroomList(roomLists)
        console.log("Go to updateChatroomList()");
    } else {
        console.log("loadAllChatroom() Failed");
    }
}

async function updateChatroomList(roomLists) {
    let roomListElem = document.querySelector('.room-list')
    // console.log("roomLists in Update: ", roomLists);
    // Print chatroom ID: RoomName
    roomListElem.innerHTML = ''
    for (let roomListItem of roomLists) {
        // console.log("roomListItem.chatroom_name: ", roomListItem.chatroom_name);
        const div = document.createElement('div');
        div.classList.add('room')
        const div2 = document.createElement('div');
        div2.classList.add('room-name');
        div2.innerText = roomListItem.chatroom_name;
        div2.onclick = function () {
            loadMessages(roomListItem.chatroom_id)
        }
        div.appendChild(div2);
        roomListElem.appendChild(div)
        // socket.emit('join_chatroom', [roomListItem.chatroom_id])
    }
    // console.log("Done updateChatroomList");
}

async function loadMessages(roomId) {
    let res = await fetch(`/get-chat-history/${roomId}`)
    if (res.ok) {
        let data = await res.json()
        console.log("loading messages")
        console.log(data);
        let messages = data.data
        if (data.messages == "No Message.") {
            return
        } else {
            updateMessages(messages)
        }
    }
    room_id = roomId
    // console.log("room_id: ", room_id);
}

async function updateMessages(messages) {
    messagesElem.innerHTML = ''
    console.log("messages: ", messages);
    
    for (let messageItem of messages){
        let timeFormat = new Date(messageItem.message_time)
        let time;
        function dateFormater (dateString , timeOnlyBoolean = false){
            let returningString;
            if (timeOnlyBoolean == true){
                returningString = `${dateString.getHours() < 10 ? '0' + JSON.stringify(dateString.getHours()):JSON.stringify(dateString.getHours()) }:${dateString.getMinutes() < 10 ? '0' + JSON.stringify(dateString.getMinutes()): JSON.stringify(dateString.getMinutes())}`
            }else{
                returningString = `${dateString.getDate()}/${dateString.getMonth()+1}/${dateString.getFullYear()-2000} ${dateString.getHours() < 10 ? '0' + JSON.stringify(dateString.getHours()):JSON.stringify(dateString.getHours()) }:${dateString.getMinutes() < 10 ? '0' + JSON.stringify(dateString.getMinutes()): JSON.stringify(dateString.getMinutes())}`
            }
            console.log("returning string: ",returningString);
            return returningString
        }
        if (dateFormater(timeFormat) == dateFormater(new Date())){
            time = `Today ${dateFormater(timeFormat,true)}`
        }else{
            time = `${dateFormater(timeFormat,false)}`
        }

        //text
        if (messageItem.content_type == 0){
            const div = document.createElement('div')
            div.setAttribute('class','row')
            if(messageItem.toMessage){ //me to others
                div.setAttribute('class','justify-content-end text-end message to ml-2')
                const innerDiv = document.createElement('div')
                innerDiv.setAttribute('class','col-sm-8 client_message p-2 bg-card')
                innerDiv.innerHTML += `
                <div>${messageItem.content}</div>
                `
                const nameDiv = document.createElement('div')
                nameDiv.innerHTML = `<div>${messageItem.first_name}</div>`
                nameDiv.setAttribute('class','col-sm-1 client_name p-2')
                const dateDiv = document.createElement('div')
                dateDiv.setAttribute('class', 'text-end')
                dateDiv.innerHTML = `<div class="text-muted">${time}</div>`

                div.append(nameDiv)
                div.append(innerDiv)
                div.append(dateDiv)
                messagesElem.append(div)
            }else{ //others to me
                div.setAttribute('class','justify-content-start text-start message from ml-2')
                const innerDiv = document.createElement('div')
                innerDiv.setAttribute('class','col-sm-8 client_message p-2 bg-card')
                innerDiv.innerHTML += `
                <div>${messageItem.content}</div>
                `
                const nameDiv = document.createElement('div')
                nameDiv.innerHTML = `<div>${messageItem.first_name}</div>`
                nameDiv.setAttribute('class','col-sm-1 client_name p-2')
                const dateDiv = document.createElement('div')
                dateDiv.setAttribute('class', 'text-end')
                dateDiv.innerHTML = `<div class="text-muted">${time}</div>`

                div.append(nameDiv)
                div.append(innerDiv)
                div.append(dateDiv)
                messagesElem.append(div)
            }
        }else{
            const div = document.createElement('div')
            div.setAttribute('class','row')
            if(messageItem.toMessage){ //me to others
                div.setAttribute('class','justify-content-end text-end message to')
                const innerDiv = document.createElement('div')
                innerDiv.setAttribute('class','col-sm-8 client_message p-2 bg-card')
                innerDiv.innerHTML += `
                <img class="img-fluid message_img" src=${messageItem.content}>
                `
                const nameDiv = document.createElement('div')
                nameDiv.innerHTML = `<div>${messageItem.first_name}</div>`
                nameDiv.setAttribute('class','col-sm-1 client_name p-2')
                const dateDiv = document.createElement('div')
                dateDiv.setAttribute('class', 'text-end')
                dateDiv.innerHTML = `<div class="text-muted">${time}</div>`


                div.append(nameDiv)
                div.append(innerDiv)
                div.append(dateDiv)
                messagesElem.append(div)
            }else{ //others to me
                div.setAttribute('class','justify-content-start text-start message from')
                const innerDiv = document.createElement('div')
                innerDiv.setAttribute('class','col-sm-8 client_message p-2 bg-card')
                innerDiv.innerHTML += `
                <img class="img-fluid message_img" src=${messageItem.content}>
                `
                const nameDiv = document.createElement('div')
                nameDiv.innerHTML = `<div>${messageItem.first_name}</div>`
                nameDiv.setAttribute('class','col-sm-1 client_name p-2')
                const dateDiv = document.createElement('div')
                dateDiv.setAttribute('class', 'text-end')
                dateDiv.innerHTML = `<div class="text-muted">${time}</div>`

                div.append(nameDiv)
                div.append(innerDiv)
                div.append(dateDiv)
                messagesElem.append(div)
            }
        }


    }




    // // For Loop
    // for (let messageItem of messages) {
    //     let timeFormat = new Date(messageItem.message_time)
    //     let time = timeFormat.getHours() + ":" + timeFormat.getMinutes() + ", " + timeFormat.toDateString()
    //     // If it's a text
    //     if (messageItem.content_type == 0) {
    //         const div = document.createElement('div');
    //         if (messageItem.toMessage) {
    //             div.classList.add('toMessage')
    //         } else {
    //             div.classList.add('fromMessage')
    //         }
    //         const div1 = document.createElement('div');
    //         div1.classList.add('sender')
    //         div1.innerText = messageItem.first_name;
    //         div.appendChild(div1);
    //         const div2 = document.createElement('div');
    //         div2.classList.add('content');
    //         div2.innerText = messageItem.content;
    //         div.appendChild(div2);
    //         const div3 = document.createElement('div');
    //         div3.classList.add('createAt');
    //         div3.innerText = time;
    //         div.appendChild(div3);
    //         messagesElem.appendChild(div)
    //     } else {
    //         const div = document.createElement('div');
    //         if (messageItem.toMessage) {
    //             div.classList.add('toImage')
    //         } else {
    //             div.classList.add('fromImage')
    //         }
    //         const div1 = document.createElement('div');
    //         div1.classList.add('sender')
    //         div1.innerText = messageItem.first_name;
    //         div.appendChild(div1);
    //         const img = document.createElement('img')
    //         img.src = messageItem.content
    //         div.appendChild(img);
    //         const div3 = document.createElement('div');
    //         div3.classList.add('createAt');
    //         div3.innerText = time;
    //         div.appendChild(div3);
    //         messagesElem.appendChild(div)
    //     }
    // }
}

async function getUserInfo() {
    let res = await fetch('/get_user_info')
    if (res.ok) {
        let user = await res.json()
    }
}

async function init() {
    await getUserInfo()
    await loadAllChatroom()
    socket.emit('join_all_chatroom', [])
}

init()

socket.on('new_msg', (data) => {
    console.log("Running socket.on");
    console.log("socket.on data: ", data);
    loadMessages(data.chatroom_id)
})