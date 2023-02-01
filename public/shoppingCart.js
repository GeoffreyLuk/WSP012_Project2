let show = document.URL.split('/show_').pop()
let showContainerElem = document.querySelector('.show-container')
let totalAmountElem = document.querySelector('.total-amount')
let checkboxElem = document.querySelector('.check-out-form').elements
let checkoutBtnElem = document.querySelector('.checkout-btn')
let ifIncludesShow = window.location.toString().includes("show_")


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
    showContainerElem.innerHTML = ''
    totalAmountElem.innerHTML = ''
    if (ticketsInfo.length > 0) {
        if (ifIncludesShow == false) {
            for (let showsItem of showsInfo) {
                console.log("showsItem: ", showsItem);
                const event = document.createElement('div')
                event.classList.add('event')
                showContainerElem.appendChild(event)
                event.setAttribute("id", "show_" + showsItem.show_id)
                const showInfo = document.createElement('div')
                showInfo.classList.add('show-info')
                event.appendChild(showInfo)
                const btnContainer = document.createElement('div')
                btnContainer.classList.add('btnContainer')
                btnContainer.onclick = function () {
                    deleteAllShowTicketsByShowName(showsItem.organiser_name)
                }
                btnContainer.innerHTML += `<i class="bi bi-x-circle"></i>`
                showInfo.appendChild(btnContainer)
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
                // console.log("Run ticketsInfo Loop");
                // console.log("ticketsItem.quantity: ", ticketsItem.quantity);
                for (i = 0; i < showContainerElem.childNodes.length; i++) {
                    if (("show_" + ticketsItem.show_id) == showContainerElem.childNodes[i].id) {
                        let eventId = showContainerElem.childNodes[i].id
                        let event = document.querySelector(`#${eventId}`)
                        let timeFormat = new Date(ticketsItem.show_date)
                        let time = timeFormat.toDateString() + " / " + timeFormat.getHours() + ":" + timeFormat.getMinutes()
                        let properDate = (dateFormater(timeFormat, false) + " " + dateFormater(timeFormat, true))
                        let properTime = dateFormater(timeFormat, true)
                        console.log("properTime: ", properTime);
                        const ticketContainer = document.createElement('div');
                        ticketContainer.classList.add('ticket-container')
                        event.appendChild(ticketContainer);
                        const ticket = document.createElement('div');
                        ticket.classList.add('ticket')
                        ticketContainer.appendChild(ticket)
                        const btnContainer = document.createElement('div')
                        btnContainer.classList.add('btnContainer')
                        btnContainer.onclick = function () {
                            deleteShowTicket(ticketsItem.users_purchases_id)
                        }
                        btnContainer.innerHTML += `<i class="bi bi-x-circle"></i>`
                        ticket.appendChild(btnContainer)
                        const ticketType = document.createElement('div');
                        ticketType.classList.add('ticket-type')
                        ticketType.innerText = ticketsItem.type
                        ticket.appendChild(ticketType)
                        const ticketPrice = document.createElement('div');
                        ticketPrice.classList.add('ticket-price')
                        ticketPrice.innerText = "$" + ticketsItem.pricing
                        ticket.appendChild(ticketPrice)
                        const ticketQuant = document.createElement('div');
                        ticketQuant.classList.add('ticket-quantity')
                        ticketQuant.innerText = ticketsItem.quantity
                        ticket.appendChild(ticketQuant)
                        const ticketDate = document.createElement('div');
                        ticketDate.classList.add('ticket-date')
                        ticketDate.innerText = properDate
                        ticket.appendChild(ticketDate)
                        const ticketVenue = document.createElement('div');
                        ticketVenue.classList.add('ticket-venue')
                        ticketVenue.innerText = ticketsItem.venue
                        ticket.appendChild(ticketVenue)
                        sumTotal += (ticketsItem.quantity * ticketsItem.pricing)
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
            const btnContainer = document.createElement('div')
            btnContainer.classList.add('btnContainer')
            btnContainer.onclick = function () {
                deleteAllShowTicketsByShowName(showsInfo.organiser_name)
            }
            btnContainer.innerHTML += `<i class="bi bi-x-circle"></i>`
            div1.appendChild(btnContainer)
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
                let properDate = (dateFormater(timeFormat, false) + " " + dateFormater(timeFormat, true))
                const ticketContainer = document.createElement('div');
                ticketContainer.classList.add('ticket-container')
                event.appendChild(ticketContainer);
                const ticket = document.createElement('div');
                ticket.classList.add('ticket')
                ticketContainer.appendChild(ticket)
                const btnContainer = document.createElement('div')
                btnContainer.classList.add('btnContainer')
                btnContainer.onclick = function () {
                    deleteShowTicket(ticketsItem.users_purchases_id)
                }
                btnContainer.innerHTML += `<i class="bi bi-x-circle"></i>`
                ticket.appendChild(btnContainer)
                const ticketType = document.createElement('div');
                ticketType.classList.add('ticket-type')
                ticketType.innerText = ticketsItem.type
                ticket.appendChild(ticketType)
                const ticketPrice = document.createElement('div');
                ticketPrice.classList.add('ticket-price')
                ticketPrice.innerText = "$" + ticketsItem.pricing
                ticket.appendChild(ticketPrice)
                const ticketQuant = document.createElement('div');
                ticketQuant.classList.add('ticket-quantity')
                ticketQuant.innerText = ticketsItem.quantity
                ticket.appendChild(ticketQuant)
                const ticketDate = document.createElement('div');
                ticketDate.classList.add('ticket-date')
                ticketDate.innerText = properDate
                ticket.appendChild(ticketDate)
                const ticketVenue = document.createElement('div');
                ticketVenue.classList.add('ticket-venue')
                ticketVenue.innerText = showsInfo.venue
                ticket.appendChild(ticketVenue)
                sumTotal += (ticketsItem.quantity * ticketsItem.pricing)
                totalAmountElem.innerText = "$" + sumTotal
            }
        }
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
        await Notiflix.Notify.success(`Removed ${organiserName}'s tickets success`);
        location.reload();
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
        await Notiflix.Notify.success(`Removed tickets success`);
        location.reload();
    }
}

function ifChecked() {
    if (!checkboxElem.agree.checked) {
        Notiflix.Notify.failure(`Please confirm purchase.`);
        return false
    } else {
        return true
    }
}

checkoutBtnElem.addEventListener('click', (e) => {
    e.preventDefault()
    if (ifChecked()) {
        proceedPayment()
    } else {
        return
    }
})

async function proceedPayment() {
    let res
    if (ifIncludesShow == false) {
        res = await fetch(`/proceed_purchase`)
    } else {
        let data = { show }
        res = await fetch(`/proceed_purchase/${show}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(data)
        })
    }
    if (res.ok) {
        let data = await res.json()
        await Notiflix.Notify.success(`Purchased! Redirect to home page in 2 seconds...`);
        setTimeout(function () {
            window.location.href = "/";
        }, 2000)
    } else {
        console.log("failed");
    }
}

function alterCheckoutBtn() {
    if (ifIncludesShow == false) {
        checkoutBtnElem.setAttribute("href", "/proceed_purchase")
    } else {
        checkoutBtnElem.setAttribute("href", `/proceed_purchase/${show}`)
    }
    return
}

init()

function dateFormater(dateObject, timeOnlyBoolean = false) {
    let returningString;
    if (timeOnlyBoolean == true) {
        returningString = `${dateObject.getHours() < 10 ? '0' + JSON.stringify(dateObject.getHours()) : JSON.stringify(dateObject.getHours())}:${dateObject.getMinutes() < 10 ? '0' + JSON.stringify(dateObject.getMinutes()) : JSON.stringify(dateObject.getMinutes())}`
    } else {
        returningString = `${dateObject.getDate()}-${dateObject.getMonth() + 1}-${dateObject.getFullYear() - 2000}`
    }
    // console.log("returning string: ", returningString);
    return returningString
}