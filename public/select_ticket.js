// Hardcode
let show = document.URL.split('/show_').pop();

let categoryElem = document.querySelector('.category')
let showNameElem = document.querySelector('.show_name')
let organiserElem = document.querySelector('.organiser')
let locationBtnElem = document.querySelector('#location > option')

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
        console.log("ticketsInfo: ", ticketsInfo);
        loadTicketsDetails(ticketsInfo)
    }
}

async function loadTicketsDetails() {
    console.log("Just vibing");
}
