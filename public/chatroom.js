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

const socket = io();

let messages = document.querySelector('#messages');
let form = document.querySelector('#form');
let input = document.querySelector('#input');
let showForm = document.querySelector('#show-form')

// Send Msg
form.addEventListener('submit', async (e) => {
    e.preventDefault();
    let msgData = {
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
    console.log("Front End Data - USER: ", data.userName);
    console.log("Front End Data - roomName: ", data.roomName);
    socket.emit('join_new_room', [data.userName, data.roomName])
})

async function loadAllChatroom() {
    let res = await fetch('/get_chatroom')
    if (res.ok) {
        let data = await res.json()
        let roomLists = data.data
        let user = data.user
        updateChatroomList(roomLists, user)
        console.log("Go to updateChatroomList()");
    } else {
        console.log("loadAllChatroom() Failed");
    }
}

async function updateChatroomList(roomLists, user) {
    let roomListElem = document.querySelector('.room-list')
    // console.log("roomLists in Update: ", roomLists);
    roomListElem.innerHTML = ''
    for (let roomListItem of roomLists) {
        console.log("roomListItem.chatroom_name: ", roomListItem.chatroom_name);
        const div = document.createElement('div');
        div.classList.add('room')
        const para = document.createElement('p');
        para.classList.add('room-name');
        para.innerText = roomListItem.chatroom_name;
        div.appendChild(para);
        roomListElem.appendChild(div)
        socket.emit('join_chatroom', [req.session.user.first_name, roomListItem.chatroom_name])
    }
    console.log("Done updateChatroomList");
}

async function updateMessages(msgs) {
    // messages.innerHTML = ''
    messages.innerHTML += `
        <div class="message">
            <div class="sender">From: Peter</div>
            <div class="content">${msgs}</div>
            <div class="createdAt">Date</div>
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

async function init() {
    await loadMsgs()
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