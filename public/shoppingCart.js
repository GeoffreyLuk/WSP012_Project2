let show = document.URL.split('/show_').pop()
let showContainerElem = document.querySelector('.show-container')
let totalAmountElem = document.querySelector('.total-amount')

console.log("show: ", show);

async function init() {
    getUserInfo()
    console.log("init()");
    loadCheckout()
}

async function loadCheckout() {
    let res = await fetch(`/get_checkout/${show}`)
    if (res.ok) {
        console.log("loadCheckout res.ok");
        let data = await res.json()
        let ticketsInfo = data.ticketsInfo
        let showsInfo = data.showsInfo
        loadTicketsByShowId(ticketsInfo, showsInfo)
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

async function loadTicketsByShowId(ticketsInfo, showsInfo) {
    // console.log("ticketsInfo: ", ticketsInfo)
    // console.log("showsInfo: ", showsInfo);
    // console.log("showsInfo.length: ", showsInfo.length);
    // console.log(typeof (showsInfo));
    if (ticketsInfo.length > 0) {
        showContainerElem.innerHTML = ''
        const event = document.createElement('div')
        event.classList.add('event')
        showContainerElem.appendChild(event)
        const div1 = document.createElement('div')
        div1.classList.add('show-info')
        event.appendChild(div1)
        const delBtn = document.createElement('a')
        delBtn.classList.add('delete')
        delBtn.onclick = function () {
            deleteAllShowTicketsByShowName(showsInfo.organiser_name)
        }
        delBtn.innerText = "deleteAllShowTicketsByShowName"
        div1.appendChild(delBtn)
        const div2 = document.createElement('div')
        div2.classList.add('organiser-name')
        div2.innerText = showsInfo.organiser_name
        div1.appendChild(div2)
        const div3 = document.createElement('div')
        div3.classList.add('show-name')
        div3.innerText = showsInfo.show_name
        div1.appendChild(div3)
        let sumTotal = 0
        for (let ticketsItem of ticketsInfo) {
            let timeFormat = new Date(ticketsItem.show_date)
            let time = timeFormat.toDateString() + " / " + timeFormat.getHours() + ":" + timeFormat.getMinutes()


            const ticketContainer = document.createElement('div');
            ticketContainer.classList.add('ticket-container')
            event.appendChild(ticketContainer);
            const ticket = document.createElement('div');
            ticket.classList.add('ticket')
            ticketContainer.appendChild(ticket)
            const delBtn = document.createElement('a')
            delBtn.classList.add('delete')
            delBtn.onclick = function () {
                deleteShowTicket(ticketsItem.type, timeFormat)
            }
            delBtn.innerText = "deleteShowTicket"
            ticket.appendChild(delBtn)
            const ticketType = document.createElement('div');
            ticketType.classList.add('ticket-type')
            ticketType.innerText = ticketsItem.type
            ticket.appendChild(ticketType)
            const ticketPrice = document.createElement('div');
            ticketPrice.classList.add('ticket-price')
            ticketPrice.innerText = "$" + ticketsItem.pricing
            ticket.appendChild(ticketPrice)
            const ticketDate = document.createElement('div');
            ticketDate.classList.add('ticket-date')
            ticketDate.innerText = time
            ticket.appendChild(ticketDate)
            const ticketVenue = document.createElement('div');
            ticketVenue.classList.add('ticket-venue')
            ticketVenue.innerText = showsInfo.venue
            ticket.appendChild(ticketVenue)

            sumTotal += ticketsItem.pricing
            totalAmountElem.innerText = "$" + sumTotal

        }
        console.log("sumTotal: ", sumTotal);
    }
}

async function deleteAllShowTicketsByShowName(organiserName) {
    console.log("organiserName: ", organiserName);
    let data = { organiserName }
    let res = await fetch('/delete_tickets_by_name', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    if (res.ok) {
        console.log("Cool!");
    }
}

async function deleteShowTicket(type, showDate) {
    console.log("type: ", type);
    console.log("showDate ", showDate);
    let eventDate = showDate + showDate.setHours((showDate.getHours() + 8))
    console.log(eventDate);
    let eventTimestamp = new Date(eventDate)
    console.log("timestamp: ", eventTimestamp);
}

init()