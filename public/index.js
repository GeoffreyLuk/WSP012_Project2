// Hardcode
let show = "show_55"
// const socket = io.connect();
// socket.on('greeting', (data) => {
//     alert(data)
// })

async function getUserInfo() {
    let res = await fetch('/get_user_info')
    if (res.ok) {
        let user = await res.json()
        console.log("user:", user);
        console.log("user_name", user.first_name)
    }
}

async function init() {
    await getUserInfo()
}

init()
