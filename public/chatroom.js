// window.onload = async () => {
//     // const searchParams = new URLSearchParams(location.search);
//     // const userId = searchParams.get("userId");

//     // Use the id to fetch data from
//     // const res = await fetch(`/chatroom/user/${userId}`)
//     // if (res.ok) {
//     //     console.log("Success");
//     // } else {
//     //     console.log("Failed");
//     // }

// }
let room_id;
const socket = io();

let messages = document.querySelector('#messages');
let form = document.querySelector('#form');
let input = document.querySelector('#input');
let showForm = document.querySelector('#show-form')
let roomListElem = document.querySelector('.room-list')

// Send Msg
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let msgData = {
        chatroom_id: room_id,
        text: input.value
    }

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
    console.log("data: ", data);
    console.log("sent");
});

// Create show
showForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    console.log("show form start");
    let showData = {
        organiser_id: 1,
        category_id: 1,
        show_name: 'test',
        show_duration: 120,
        sales_start_date: '2022-01-01',
        sales_end_date: '2022-02-01',
        published: false,
        launch_date: '2022-06-01',
        end_date: '2022-07-01',
        details: {
            "text": "I go to school by bus"
        },
    }
    console.log("about to send showData");
    let res = await fetch('/create_show', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(showData)
    })
    console.log("Got res");
    let data = await res.json()
    socket.emit('join_new_room', [data.roomId])
})

// roomListElem.addEventListener('click', async (e) => {
//     console.log("clicked");
//     let roomId = ''
//     if (e.target.matches('.room-id')) {
//         roomId = e.target.innerText
//     } else {
//         return
//     }
//     console.log("roomId: ", roomId);
//     let res = await fetch(`/get-chat-history/${roomId}`)

// })

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
        console.log("roomListItem.chatroom_name: ", roomListItem.chatroom_name);
        const div = document.createElement('div');
        div.classList.add('room')
        const div1 = document.createElement('div');
        div1.classList.add('room-id');
        div1.innerText = roomListItem.chatroom_id;
        div1.onclick = function () {
            loadMessages(roomListItem.chatroom_id)
        }
        div.appendChild(div1);
        const div2 = document.createElement('div');
        div2.classList.add('room-name');
        div2.innerText = roomListItem.chatroom_name;
        div.appendChild(div2);
        roomListElem.appendChild(div)
        socket.emit('join_chatroom', [roomListItem.chatroom_id])
    }
    console.log("Done updateChatroomList");
}

async function loadMessages(roomId) {
    let res = await fetch(`/get-chat-history/${roomId}`)
    if (res.ok) {
        let data = await res.json()
        console.log("loadMsg()'s data:", data);
        console.log("data.data: ", data.data);
        let msgs = data.data.content
        let time = data.data.message_time
        updateMessages(msgs, time)
    }
    room_id = roomId
}


async function updateMessages(msgs, time) {
    // messages.innerHTML = ''
    messages.innerHTML += `
        <div class="message">
            <div class="sender">From: Peter</div>
            <div class="content">${msgs}</div>
            <div class="createdAt">${time}</div>
        </div>
        `
}

async function loadMsgs() {
    // console.log("LoadMsg Start");
    let res = await fetch('/send_msg')
    // console.log("res.ok?: ", res.ok);
    if (res.ok) {
        let data = await res.json()
        // console.log("data in loadMsgs(): ", data.text);
        let msgs = data.text

        updateMessages(msgs)
        // console.log(msgs);
    } else {
        alert("cannot fetch memo")
    }
}

async function getUserInfo() {
    let res = await fetch('/get_user_info')
    if (res.ok) {
        let user = await res.json()
        // console.log("user:", user);
    }
}

async function init() {
    await loadMsgs()
    await getUserInfo()
    const socket = io.connect();
    socket.on('new_msg', () => {
        console.log("connected?");
        loadMsgs()
    })
    await loadAllChatroom()
    socket.on('get_all_chatroom', () => {
        loadAllChatroom()
        console.log("Loaded all chatroom la!");
    })
}

init()