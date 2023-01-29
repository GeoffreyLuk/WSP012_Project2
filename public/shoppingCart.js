let show = document.URL.split('/show_').pop()

console.log("show: ", show);

async function init() {
    getUserInfo()
    console.log("init()");
    loadCheckout()
}

async function loadCheckout() {
    let res = await fetch(`/get_checkout/${show}`)
    if (res.ok) {
        let data = await res.json()
        console.log("data: ", data);
    } else {
        console.log("7.7");
    }
}

async function getUserInfo() {
    let res = await fetch('/get_user_info')
    if (res.ok) {
        let user = await res.json()
        console.log("user: ", user);
    }
}

init()