// Hardcode
let show = document.URL.split('/show_').pop();

let categoryElem = document.querySelector('.category')
let showNameElem = document.querySelector('.show_name')
let organiserElem = document.querySelector('.organiser')
let locationBtnElem = document.querySelector('#location > option')
let eventDateElem = document.querySelector('.event-date-selector')
let ticketTypeElem = document.querySelector('.ticket-type-selector')
let ticketContainerElem = document.querySelector('.ticket-container')

// const toTimestamp = (strDate) => {
//     const dt = new Date(strDate).getTime();
//     return dt / 1000;
// }

window.onload = () => {
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
        const opt = document.createElement('option')
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
    console.log("ticketsInfo: ", ticketsInfo);
    ticketContainerElem.innerHTML = ''
    for (let ticketInfoItem of ticketsInfo) {
        let timeFormat = new Date(ticketInfoItem.show_date)
        let date = timeFormat.toDateString()
        let time = timeFormat.getHours() + ":" + timeFormat.getMinutes()
        let div = document.createElement('div')
        div.classList.add('ticket')
        let div1 = document.createElement('div')
        div1.classList.add('show-date')
        div1.innerText = date
        div.appendChild(div1);
        let div2 = document.createElement('div')
        div2.classList.add('show-time')
        div2.innerText = time
        div.appendChild(div2);
        let div3 = document.createElement('div')
        div3.classList.add('ticket-type')
        div3.innerText = ticketInfoItem.type
        div.appendChild(div3);
        let div4 = document.createElement('div')
        div4.classList.add('ticket-price')
        div4.innerText = "$" + ticketInfoItem.pricing
        div.appendChild(div4);
        let select = document.createElement('select')
        select.classList.add('ticket-quantity')
        div.appendChild(select);
        let opt = document.createElement('option')
        opt.innerText = 0
        select.appendChild(opt);
        let opt1 = document.createElement('option')
        opt1.innerText = 1
        select.appendChild(opt1);
        ticketContainerElem.appendChild(div)
    }
}

eventDateElem.addEventListener('change', (e) => {
    // console.log("changed");
    let dateFormat = new Date(eventDateElem.value)
    let eventDate = dateFormat + dateFormat.setHours((dateFormat.getHours() + 8))
    let eventTimestamp = new Date(eventDate)
    // console.log("timestamp: ", eventTimestamp);
    if (dateFormat == '') {
        loadTicketsInfo()
    } else {
        filterTicketByDate(eventTimestamp)
    }
})

async function filterTicketByDate(eventDate) {
    // console.log("eventDate: ", eventDate);
    let filterData = {
        eventDate,
        show
    }
    console.log("filterData: ", filterData);
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
    loadTickets(filteredTickets)
}