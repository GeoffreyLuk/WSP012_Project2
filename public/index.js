const socket = io.connect();

// socket.on('greeting', (data) => {
//     alert(data)
// })

async function getUserInfo() {
    let res = await fetch('/get_user_info')
    if (res.ok) {
        let user = await res.json()
        console.log("user:", user);
    }
}

async function init() {
    getUserInfo()
}

init()