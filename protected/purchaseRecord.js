async function init() {
    getUserInfo()
}

async function getPurchasedTicket(userId) {
    console.log("userId: ", userId);
    let res = await fetch(`/get_purchased_tickets/${userId}`)
    if (res.ok) {
        console.log("res.ok!");
        let data = await res.json()
        console.log("data: ", data);
        let purchasedTickets = data.data
        console.log("purchasedTickets: ", purchasedTickets);
    }
}

async function getUserInfo() {
    let res = await fetch('/get_user_info')
    if (res.ok) {
        let user = await res.json()
        console.log(user);
        getPurchasedTicket(user.id)
    }
}

init()