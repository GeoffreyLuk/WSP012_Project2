let ticketContainerElem = document.querySelector('.purchased-tickets-container')

async function init() {
    getUserInfo()
}

async function getPurchasedTicket(userId) {
    console.log("userId: ", userId);
    let res = await fetch(`/get_purchased_tickets/${userId}`)
    if (res.ok) {
        // console.log("res.ok!");
        let data = await res.json()
        // console.log("data: ", data);
        let purchasedTickets = data.data
        // console.log("purchasedTickets: ", purchasedTickets);
        loadPurchasedTickets(purchasedTickets)
    }
}

async function getUserInfo() {
    let res = await fetch('/get_user_info')
    if (res.ok) {
        let user = await res.json()
        // console.log(user);
        getPurchasedTicket(user.id)
    }
}

function loadPurchasedTickets(ticketsInfo) {
    console.log("ticketsInfo: ", ticketsInfo);
    ticketContainerElem.innerHTML = ''
    for (let recordItem of ticketsInfo) {
        console.log("recordItem: ", recordItem);
        let sum = recordItem.pricing * recordItem.quantity
        let purchaseDateFormat = new Date(recordItem.purchase_date)
        let purchaseDateFormatDate = purchaseDateFormat.toDateString()
        let purchaseDateFormatTime = purchaseDateFormat.getHours() + ":" + purchaseDateFormat.getMinutes()
        let showDateFormat = new Date(recordItem.show_date)
        let showDateFormatDate = showDateFormat.toDateString()
        let showDateFormatTime = showDateFormat.getHours() + ":" + showDateFormat.getMinutes()
        // purchasedTicketItem
        const purchasedTicket = document.createElement('div')
        purchasedTicket.classList.add('purchased-ticket')
        ticketContainerElem.appendChild(purchasedTicket)
        // purchased-ticket-title-box
        const purchasedTicketTitleBox = document.createElement('div')
        purchasedTicketTitleBox.classList.add('purchased-ticket-title-box')
        purchasedTicket.appendChild(purchasedTicketTitleBox)
        const purchasedTicketTitle = document.createElement('div')
        purchasedTicketTitle.classList.add('purchased-ticket-title')
        purchasedTicketTitleBox.appendChild(purchasedTicketTitle)
        const div = document.createElement('div')
        div.innerHTML = `<span>Booking summary</span> - #${recordItem.purchaserecord_id}`
        purchasedTicketTitle.appendChild(div)
        const div2 = document.createElement('div')
        div2.innerHTML = `<span>Purchase time</span>: ${purchaseDateFormatDate}, ${purchaseDateFormatTime}`
        purchasedTicketTitle.appendChild(div2)
        // purchased-ticket-title-content
        const purchasedTicketTitleContent = document.createElement('div')
        purchasedTicketTitleContent.classList.add('purchased-ticket-title-content')
        purchasedTicketTitleBox.appendChild(purchasedTicketTitleContent)
        // table
        const table = document.createElement('table')
        purchasedTicketTitleContent.appendChild(table)
        const tbody = document.createElement('tbody')
        table.appendChild(tbody)
        const tr = document.createElement('tr')
        tbody.appendChild(tr)
        const tdTotal = document.createElement('td')
        tdTotal.innerHTML = `<span>Total</span>: `
        tr.appendChild(tdTotal)
        const tdPrice = document.createElement('td')
        tdPrice.innerHTML = `$${sum}`
        tr.appendChild(tdPrice)
        // purchased-ticket-content-container
        const purchasedTicketContentContainer = document.createElement('div')
        purchasedTicketContentContainer.classList.add('purchased-ticket-content-container')
        purchasedTicket.appendChild(purchasedTicketContentContainer)
        const purchasedTicketContent = document.createElement('div')
        purchasedTicketContent.classList.add('purchased-ticket-content')
        purchasedTicketContentContainer.appendChild(purchasedTicketContent)
        const colWrapper = document.createElement('div')
        colWrapper.classList.add('col_wrapper')
        purchasedTicketContent.appendChild(colWrapper)
        const row = document.createElement('div')
        row.classList.add('row')
        colWrapper.appendChild(row)
        const col3 = document.createElement('div')
        col3.classList.add('col-3')
        col3.innerText = "img"
        row.appendChild(col3)
        const col9 = document.createElement('div')
        col9.classList.add('col-9')
        row.appendChild(col9)
        const colSpacing = document.createElement('div')
        colSpacing.classList.add('col-spacing')
        col9.appendChild(colSpacing)
        const purchasedTicketItem = document.createElement('div')
        purchasedTicketItem.classList.add('purchased-ticket-item')
        colSpacing.appendChild(purchasedTicketItem)
        // Table
        const table2 = document.createElement('table')
        purchasedTicketItem.appendChild(table2)
        const tbody2 = document.createElement('tbody')
        table2.appendChild(tbody2)
        const tr2 = document.createElement('tr')
        tbody2.appendChild(tr2)
        const tdOrganiser = document.createElement('td')
        tdOrganiser.innerHTML = `<span>Organiser</span>: `
        tr2.appendChild(tdOrganiser)
        const tdOrganiserName = document.createElement('td')
        tdOrganiserName.innerHTML = `<span>${recordItem.organiser_name}</span> `
        tr2.appendChild(tdOrganiserName)
        const tr3 = document.createElement('tr')
        tbody2.appendChild(tr3)
        const tdEvent = document.createElement('td')
        tdEvent.innerHTML = `<span>Event Name</span>: `
        tr3.appendChild(tdEvent)
        const tdEventName = document.createElement('td')
        tdEventName.innerHTML = `<span>${recordItem.show_name}</span> `
        tr3.appendChild(tdEventName)
        const tr4 = document.createElement('tr')
        tbody2.appendChild(tr4)
        const tdQuan = document.createElement('td')
        tdQuan.innerHTML = `<span>Quantity</span>: `
        tr4.appendChild(tdQuan)
        const tdQuantity = document.createElement('td')
        tdQuantity.innerHTML = `<span>${recordItem.quantity}</span> `
        tr4.appendChild(tdQuantity)
        const tr5 = document.createElement('tr')
        tbody2.appendChild(tr5)
        const tdPriceTitle = document.createElement('td')
        tdPriceTitle.innerHTML = `<span>Price</span>: `
        tr5.appendChild(tdPriceTitle)
        const tdPricing = document.createElement('td')
        tdPricing.innerHTML = `<span>${sum}</span> `
        tr5.appendChild(tdPricing)
        const tr6 = document.createElement('tr')
        tbody2.appendChild(tr6)
        const tdVenueTitle = document.createElement('td')
        tdVenueTitle.innerHTML = `<span>Venue</span>: `
        tr6.appendChild(tdVenueTitle)
        const tdVenue = document.createElement('td')
        tdVenue.innerHTML = `<span>${recordItem.venue}</span> `
        tr6.appendChild(tdVenue)
        const tr7 = document.createElement('tr')
        tbody2.appendChild(tr7)
        const tdStartTime = document.createElement('td')
        tdStartTime.innerHTML = `<span>Start Time</span>: `
        tr7.appendChild(tdStartTime)
        const tdEventDate = document.createElement('td')
        tdEventDate.innerHTML = `<span>${showDateFormatDate}, ${showDateFormatTime}</span> `
        tr7.appendChild(tdEventDate)
    }
}

init()