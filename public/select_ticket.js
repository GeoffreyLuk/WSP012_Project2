let show = document.URL.split('/show_').pop();

let categoryElem = document.querySelector('.category')
let showNameElem = document.querySelector('.show_name')
let organiserElem = document.querySelector('.organiser')
let locationBtnElem = document.querySelector('#location-selector > option')
let eventDateElem = document.querySelector('#event-date-selector')
let ticketTypeElem = document.querySelector('#ticket-type-selector')
let ticketContainerElem = document.querySelector('.ticket-container')
let ticketElemAll = document.getElementsByClassName('ticket')
let checkOutBtnElem = document.querySelector('.check-out-btn')

window.onload = () => {
    getUserInfo()
    loadShowInfo()
    loadTicketsInfo()
}

async function loadShowInfo() {
    let res = await fetch(`/get_show_info/${show}`);
    if (res.ok) {
        let data = await res.json()
        let showInfo = data.data
        loadShowDetails(showInfo)
    }
}

async function loadShowDetails(showInfo) {
    // console.log("showInfo: ", showInfo);
    categoryElem.innerHTML = ''
    showNameElem.innerHTML = ''
    organiserElem.innerHTML = ''
    categoryElem.innerHTML = showInfo.category
    showNameElem.innerHTML = showInfo.show_name
    organiserElem.innerHTML = showInfo.organiser_name
    locationBtnElem.innerHTML = showInfo.venue
}

async function loadTicketsInfo() {
    let res = await fetch(`/get_tickets_info/${show}`)
    if (res.ok) {
        let data = await res.json()
        let ticketsInfo = data.data
        loadTicketsDetails(ticketsInfo)
        loadTickets(ticketsInfo)
    }
}

async function loadTicketsDetails(ticketsInfo) {
    let ticketTypes = [];
    let eventDates = [];
    eventDateElem.innerHTML = '';
    ticketTypeElem.innerHTML = '';

    const opt = document.createElement('option')
    opt.text = "All Event-date"
    eventDateElem.appendChild(opt)
    const opt1 = document.createElement('option')
    opt1.text = "All Ticket-type"
    ticketTypeElem.appendChild(opt1)

    for (let i = 0; i < ticketsInfo.length; i++) {
        if (!ticketTypes.includes(ticketsInfo[i].type)) {
            ticketTypes.push(ticketsInfo[i].type)
        }
    };
    // console.log("ticketTypes: ", ticketTypes);

    for (let i = 0; i < ticketsInfo.length; i++) {
        if (!eventDates.includes(ticketsInfo[i].show_date)) {
            eventDates.push(ticketsInfo[i].show_date)
        }
    }
    // console.log("eventDates: ", eventDates);

    for (let eventDate of eventDates) {
        let timeFormat = new Date(eventDate)
        let date = timeFormat.toDateString() + " " + timeFormat.getHours() + ":" + timeFormat.getMinutes()
        let day = timeFormat.getDate()
        const opt = document.createElement('option')
        opt.setAttribute('class', 'targetDate')
        opt.setAttribute("id", `opt_${day}`)
        opt.text = date
        eventDateElem.appendChild(opt)
    };

    for (let ticketType of ticketTypes) {
        const opt = document.createElement('option')
        opt.text = ticketType
        ticketTypeElem.appendChild(opt)
    }
}

async function loadTickets(ticketsInfo) {
    // console.log("ticketsInfo: ", ticketsInfo);
    ticketContainerElem.innerHTML = ''
    for (let ticketInfoItem of ticketsInfo) {
        let timeFormat = new Date(ticketInfoItem.show_date)
        let date = timeFormat.toDateString()
        let time = timeFormat.getHours() + ":" + timeFormat.getMinutes()
        let div = document.createElement('div')
        div.classList.add('ticket')
        let ticketInfoContainer = document.createElement('div')
        ticketInfoContainer.classList.add('ticket-info-container')
        div.appendChild(ticketInfoContainer);
        let div1 = document.createElement('div')
        div1.classList.add('show-date')
        div1.innerText = date
        ticketInfoContainer.appendChild(div1);
        let div2 = document.createElement('div')
        div2.classList.add('show-time')
        div2.innerText = time
        ticketInfoContainer.appendChild(div2);
        let ticketInfoTextContainer = document.createElement('div')
        ticketInfoTextContainer.classList.add('ticket-info-text-container')
        div.appendChild(ticketInfoTextContainer);
        let div3 = document.createElement('div')
        div3.classList.add('ticket-type')
        div3.innerText = ticketInfoItem.type
        ticketInfoTextContainer.appendChild(div3);
        let ticketInfoTextContainer2 = document.createElement('div')
        ticketInfoTextContainer2.classList.add('ticket-info-text-container')
        div.appendChild(ticketInfoTextContainer2);
        let div4 = document.createElement('div')
        div4.classList.add('ticket-price')
        div4.innerText = "$" + ticketInfoItem.pricing
        ticketInfoTextContainer2.appendChild(div4);
        let ticketInfoTextContainer3 = document.createElement('div')
        ticketInfoTextContainer3.classList.add('ticket-info-text-container')
        div.appendChild(ticketInfoTextContainer3);
        let select = document.createElement('select')
        select.classList.add('ticket-quantity')
        ticketInfoTextContainer3.appendChild(select);
        let opt = document.createElement('option')
        opt.innerText = 0
        select.appendChild(opt);
        let opt1 = document.createElement('option')
        opt1.innerText = 1
        select.appendChild(opt1);
        let opt2 = document.createElement('option')
        opt2.innerText = 2
        select.appendChild(opt2);
        let opt3 = document.createElement('option')
        opt3.innerText = 3
        select.appendChild(opt3);
        let opt4 = document.createElement('option')
        opt4.innerText = 4
        select.appendChild(opt4);
        ticketContainerElem.appendChild(div)
    }
}

eventDateElem.addEventListener('change', (e) => {
    console.log("changed");
    let dateFormat = new Date(eventDateElem.value)
    console.log("dateFormat: ", dateFormat);
    let eventDate = dateFormat + dateFormat.setHours((dateFormat.getHours() + 8))
    let eventTimestamp = new Date(eventDate)
    let eventDay = eventTimestamp.getDate();
    console.log("timestamp: ", eventTimestamp);
    if (eventDateElem.value == 'All Event-date') {
        console.log('loadTicketsInfo()')
        loadTicketsInfo()
        return
    } else {
        console.log('filterTicketByDate')
        filterTicketByDate(eventTimestamp)
        toggleCalendarbyFilter(eventDay)
        return
    }
})

async function filterTicketByDate(eventDate) {
    // console.log("eventDate: ", eventDate);
    let filterData = {
        eventDate,
        show
    }
    // let eventDay = eventDate.getDate();
    // console.log("eventDay: ", eventDay);
    // console.log("filterData: ", filterData);
    let res = await fetch('/filter_date', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(filterData)
    })

    let data = await res.json()
    let filteredTickets = data.data
    ticketTypeElem.value = "All Ticket-type"
    loadTickets(filteredTickets)

}

ticketTypeElem.addEventListener('change', (e) => {
    console.log("changed");
    let type = ticketTypeElem.value
    console.log("type: ", type);
    if (type == 'All Ticket-type') {
        loadTicketsInfo()
    } else {
        filterTicketByType(type)
    }
})

async function filterTicketByType(type) {
    console.log("type: ", type);
    let filterData = {
        type,
        show
    }
    console.log("filterData: ", filterData);
    let res = await fetch('/filter_type', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(filterData)
    })

    let data = await res.json()
    let filteredTickets = data.data
    eventDateElem.value = "All Event-date"
    resetDateFilter()
    loadTickets(filteredTickets)
}

checkOutBtnElem.addEventListener('click', () => {
    console.log("checkOutBtn clicked");
    let selectedTickets = []
    let tickets = Array.from(ticketElemAll)
    for (let ticket of tickets) {
        console.log(`ticket.lastChild.value: ${ticket.lastChild.lastChild.value}`);
        if (ticket.lastChild.lastChild.value >= 1) {
            console.log("Hi");
            let quantity = ticket.lastChild.lastChild.value
            let price = ticket.childNodes[2].innerText.replace("$", "")
            let type = ticket.childNodes[1].innerText
            let selectedDate = new Date(ticket.childNodes[0].childNodes[0].innerHTML)
            console.log("selectedDate: ", selectedDate);
            let selectedTime = ticket.childNodes[0].childNodes[1].innerHTML
            console.log("selectedTime: ", selectedTime);
            let selectedHr = selectedTime.substr(0, 2)
            console.log("selectedHr: ", selectedHr);
            // let dateFormat = new Date(selectedDate + selectedTime)
            // console.log("dateFormat: ", dateFormat);
            let eventDate = new Date(selectedDate + selectedDate.setHours((selectedDate.getHours() + Number(selectedHr) + 8)))
            console.log("eventDate: ", eventDate);
            selectedTickets.push({ quantity, price, type, eventDate })
        }
    }
    console.log("selectedTickets: ", selectedTickets);
    checkOut(selectedTickets)
})

async function checkOut(selectedTickets) {
    console.log("run check out");
    let res = await fetch(`/select_tickets/${show}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(selectedTickets)
    })
    if (res.ok) {
        let data = await res.json()
        console.log("data: ", data);
        window.location = `/checkout/show_${show}`
    }
}

async function getUserInfo() {
    let res = await fetch('/get_user_info')
    if (res.ok) {
        let user = await res.json()
    }
}

function dateFormater(dateObject, timeOnlyBoolean = false) {
    let returningString;
    if (timeOnlyBoolean == true) {
        returningString = `${dateObject.getHours() < 10 ? '0' + JSON.stringify(dateObject.getHours()) : JSON.stringify(dateObject.getHours())}:${dateObject.getMinutes() < 10 ? '0' + JSON.stringify(dateObject.getMinutes()) : JSON.stringify(dateObject.getMinutes())}`
    } else {
        returningString = `${dateObject.getDate()}-${dateObject.getMonth() + 1}-${dateObject.getFullYear() - 2000}`
    }
    console.log("returning string: ", returningString);
    return returningString
}