let show = document.URL.split('/show_').pop()
let showContainerElem = document.querySelector('.show-container')
let totalAmountElem = document.querySelector('.total-amount')
let checkboxElem = document.querySelector('.check-out-form').elements
let checkoutBtnElem = document.querySelector('.checkout-btn')
let ifIncludesShow = window.location.toString().includes("show_")
let alterElem = document.querySelector('.check-out-item > a')


console.log("URL to string: ", ifIncludesShow);
console.log("show: ", show);

async function init() {
    getUserInfo()
    // console.log("init()");
    loadCheckout()
    alterCheckoutBtn()
}

async function loadCheckout() {
    let res
    if (ifIncludesShow == false) {
        res = await fetch(`/get_checkout`)
    } else {
        res = await fetch(`/get_checkout/${show}`)
    }
    if (res.ok) {
        // console.log("loadCheckout res.ok");
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
    let sumTotal = 0
    // console.log("ticketsInfo: ", ticketsInfo)
    showContainerElem.innerHTML = ''
    if (ticketsInfo.length > 0) {
        if (ifIncludesShow == false) {
            console.log("False");
            console.log("ticketsInfo: ", ticketsInfo);
            // console.log("showsInfo: ", showsInfo);
            for (let showsItem of showsInfo) {
                console.log("showsItem: ", showsItem);
                const event = document.createElement('div')
                event.classList.add('event')
                showContainerElem.appendChild(event)
                event.setAttribute("id", "show_" + showsItem.show_id)
                const showInfo = document.createElement('div')
                showInfo.classList.add('show-info')
                event.appendChild(showInfo)
                const delBtn = document.createElement('a')
                delBtn.classList.add('delete')
                delBtn.onclick = function () {
                    deleteAllShowTicketsByShowName(showsItem.organiser_name)
                }
                delBtn.innerText = "deleteAllShowTicketsByShowName"
                showInfo.appendChild(delBtn)
                const organiserName = document.createElement('div')
                organiserName.classList.add('organiser-name')
                organiserName.innerText = showsItem.organiser_name
                showInfo.appendChild(organiserName)
                const showName = document.createElement('div')
                showName.classList.add('show-name')
                showName.innerText = showsItem.show_name
                showInfo.appendChild(showName)
            }
            for (let ticketsItem of ticketsInfo) {
                console.log("Run ticketsInfo Loop");
                for (i = 0; i < showContainerElem.childNodes.length; i++) {
                    console.log("showContainerElem.childNodes[i].id:", showContainerElem.childNodes[i].id);
                    if (("show_" + ticketsItem.show_id) == showContainerElem.childNodes[i].id) {
                        let eventId = showContainerElem.childNodes[i].id
                        let event = document.querySelector(`#${eventId}`)
                        console.log("eventId", eventId);
                        let timeFormat = new Date(ticketsItem.show_date)
                        let time = timeFormat.toDateString() + " / " + timeFormat.getHours() + ":" + timeFormat.getMinutes()
                        console.log("time: ", time);
                        const ticketContainer = document.createElement('div');
                        ticketContainer.classList.add('ticket-container')
                        event.appendChild(ticketContainer);
                        const ticket = document.createElement('div');
                        ticket.classList.add('ticket')
                        ticketContainer.appendChild(ticket)
                        const delBtn = document.createElement('a')
                        delBtn.classList.add('delete')
                        delBtn.onclick = function () {
                            deleteShowTicket(ticketsItem.users_purchases_id)
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
                        ticketVenue.innerText = ticketsItem.venue
                        ticket.appendChild(ticketVenue)
                        sumTotal += ticketsItem.pricing
                        totalAmountElem.innerText = "$" + sumTotal
                    }
                }
            }
        } else {
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
                    deleteShowTicket(ticketsItem.users_purchases_id)
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
        }

        // console.log("sumTotal: ", sumTotal);
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

async function deleteShowTicket(selectedTicketId) {
    console.log("selectedTicketId: ", selectedTicketId);
    let data = { selectedTicketId }
    let res = await fetch('/delete_ticket', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    if (res.ok) {
        console.log("deleteShowTicket works");
    }
}

function ifChecked() {
    if (!checkboxElem.agree.checked) {
        console.log("No check");
        return false
    } else {
        return true
    }
}

checkoutBtnElem.addEventListener('click', (e) => {
    e.preventDefault()
    console.log("Clicked");
    if (ifChecked()) {
        proceedPayment()
    } else {
        return
    }
})

async function proceedPayment() {
    let res
    if (ifIncludesShow == false) {
        console.log("No show id");
        res = await fetch(`/proceed_purchase`)
    } else {
        console.log("Show ID");
        let data = { show }
        res = await fetch(`/proceed_purchase/${show}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
        console.log(data);
    }
    if (res.ok) {
        let data = await res.json()
        console.log("proceedPayment data: ", data);
    } else {
        console.log("failed");
    }
}

function alterCheckoutBtn() {
    if (ifIncludesShow == false) {
        alterElem.setAttribute("href", "/proceed_purchase")
    } else {
        alterElem.setAttribute("href", `/proceed_purchase/${show}`)
    }
    return
}

init()