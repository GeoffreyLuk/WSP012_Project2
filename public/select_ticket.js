// Hardcode
let show = document.URL.split('/show_').pop();

let categoryElem = document.querySelector('.category')
let showNameElem = document.querySelector('.show_name')
let organiserElem = document.querySelector('.organiser')
let locationBtnElem = document.querySelector('#location > option')
let eventDateElem = document.querySelector('.event-date-selector')
let ticketTypeElem = document.querySelector('.ticket-type-selector')

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
    for (let i = 0; i < ticketsInfo.length; i++) {
        if (!ticketTypes.includes(ticketsInfo[i].ticket_type)) {
            ticketTypes.push(ticketsInfo[i].ticket_type)
        }
    };
    console.log("ticketTypes: ", ticketTypes);

    let eventDates = [];
    for (let i = 0; i < ticketsInfo.length; i++) {
        if (!eventDates.includes(ticketsInfo[i].show_date)) {
            eventDates.push(ticketsInfo[i].show_date)
        }
    }
    console.log("eventDates: ", eventDates);

    for (let eventDate of eventDates) {
        const opt = document.createElement('option')
        opt.text = eventDate
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
}