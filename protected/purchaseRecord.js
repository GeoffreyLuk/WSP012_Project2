let ticketContainerElem = document.querySelector('#all-purchases')

async function init() {
    getUserInfo()
}

async function getPurchasedTicket(userId) {
    // console.log("userId: ", userId);
    let res = await fetch(`/get_purchased_tickets/${userId}`)
    if (res.ok) {
        // console.log("res.ok!");
        let data = await res.json()
        // console.log("data: ", data);
        let purchasedTickets = data.data
        let images = data.images
        loadPurchasedTickets(purchasedTickets, images)
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

function loadPurchasedTickets(ticketsInfo, imageinfo) {
    // console.log("ticketsInfo: ", ticketsInfo);
    ticketContainerElem.innerHTML = ''
    if (ticketsInfo.length == 0) {
        ticketContainerElem.innerHTML = `<h1 class="text-center text-accent1">No Shows to Show</h1>`
    } else {
        for (let recordItem of ticketsInfo) {

            ticketContainerElem.innerHTML += `
        <div id="purchase_container_${recordItem['purchaserecord_id']}" class="storage">
            <div class="header_outline bg-container">
                <div id="purchase_header_${recordItem['purchaserecord_id']}" class="row purchase_header d-flex justify-content-between text-accent1 p-2">
                    <div id="booking_id_${recordItem['purchaserecord_id']}" class="booking_id col-sm-6 col-sm-6 col-4 subtitle">Booking summary - #${recordItem['purchaserecord_id']}</div>
                    <div id="booking_time_${recordItem['purchaserecord_id']}" class="booking_time col-md-6 col-sm-6 col-4 text-muted text-end">Purchase time: ${dateFormater(new Date(recordItem['purchase_date']), false)}</div>
                </div>
                <div id="purchase_price_${recordItem['purchaserecord_id']}" class="row purchase_price p-2 subtitle text-main">
                    <div id="price_breakdown_${recordItem['purchaserecord_id']}" class="col-4 price_breakdown">
                        <div>Total:	$${recordItem['pricing']}</div><br>
                    </div>
                </div>
            </div>
            <div id="purchase_block_${recordItem['purchaserecord_id']}" class="col d-flex justify-content-center purchase_block bg-card p-2">
                <div id="purchase_image_${recordItem['purchaserecord_id']}" class="col-5 purchase_img d-flex align-items-center">
                    <img class="img-fluid show_preview" src="/assets/organisations/${imageinfo[recordItem['show_id']]}">
                </div>
                <div id="purchase_details_${recordItem['purchaserecord_id']}" class="col-7 purchase_details text-main">
                <div class="row">
                    <div class="col-1"></div>
                    <div class="col-4 subtitle text-accent1">Organiser:</div>
                    <div class="col">${recordItem['organiser_name']}</div>
                </div>
                <div class="row">
                    <div class="col-1"></div>
                    <div class="col-4 subtitle text-accent1">Event Name:</div>
                    <div class="col">${recordItem['show_name']}</div>
                </div>
                <div class="row">
                    <div class="col-1"></div>
                    <div class="col-4 subtitle text-accent1">Quantity:</div>
                    <div class="col">${recordItem['quantity']}</div>
                </div>
                <div class="row">
                    <div class="col-1"></div>
                    <div class="col-4 subtitle text-accent1">Venue:</div>
                    <div class="col">${recordItem['venue']}</div>
                </div>
                <div class="row">
                    <div class="col-1"></div>
                    <div class="col-4 subtitle text-accent1">Start Time:</div>
                    <div class="col">${dateFormater(new Date(recordItem['show_date']), false)}</div>
                </div>
                  
                </div>
            </div>
        </div>
        <div class="breaker"></div>
        `

            /* <div class="organiser_label">Organiser:</div><br>
            <div class="event_name_label">Event Name:</div><br>
            <div class="quantity_label">Quantity:</div><br>
            <div class="venue_label">Venue:</div><br>
            <div class="start_time_label">Start Time:</div><br>
            
            <div class="organiser">${recordItem['organiser_name']}</div><br>
            <div class="event_name">${recordItem['show_name']}</div><br>
            <div class="quantity">${recordItem['quantity']}</div><br>
            <div class="venue">${recordItem['venue']}</div><br>
            <div class="start_time">${dateFormater(new Date(recordItem['show_date']), false)}</div><br></br> */


            // // console.log("recordItem: ", recordItem);
            // let sum = recordItem.pricing ${recordItem['purchaserecord_id']} recordItem.quantity
            // let purchaseDateFormat = new Date(recordItem.purchase_date)
            // let purchaseDateFormatDate = purchaseDateFormat.todateObject()
            // let purchaseDateFormatTime = purchaseDateFormat.getHours() + ":" + purchaseDateFormat.getMinutes()
            // let showDateFormat = new Date(recordItem.show_date)
            // let showDateFormatDate = showDateFormat.todateObject()
            // let showDateFormatTime = showDateFormat.getHours() + ":" + showDateFormat.getMinutes()
            // // purchasedTicketItem
            // const purchasedTicket = document.createElement('div')
            // purchasedTicket.classList.add('purchased-ticket')
            // ticketContainerElem.appendChild(purchasedTicket)
            // // purchased-ticket-title-box
            // const purchasedTicketTitleBox = document.createElement('div')
            // purchasedTicketTitleBox.classList.add('purchased-ticket-title-box')
            // purchasedTicket.appendChild(purchasedTicketTitleBox)
            // const purchasedTicketTitle = document.createElement('div')
            // purchasedTicketTitle.classList.add('purchased-ticket-title')
            // purchasedTicketTitleBox.appendChild(purchasedTicketTitle)
            // const div = document.createElement('div')
            // div.innerHTML = `<span>Booking summary</span> - #${recordItem.purchaserecord_id}`
            // purchasedTicketTitle.appendChild(div)
            // const div2 = document.createElement('div')
            // div2.innerHTML = `<span>Purchase time</span>: ${purchaseDateFormatDate}, ${purchaseDateFormatTime}`
            // purchasedTicketTitle.appendChild(div2)
            // // purchased-ticket-title-content
            // const purchasedTicketTitleContent = document.createElement('div')
            // purchasedTicketTitleContent.classList.add('purchased-ticket-title-content')
            // purchasedTicketTitleBox.appendChild(purchasedTicketTitleContent)
            // // table
            // const table = document.createElement('table')
            // purchasedTicketTitleContent.appendChild(table)
            // const tbody = document.createElement('tbody')
            // table.appendChild(tbody)
            // const tr = document.createElement('tr')
            // tbody.appendChild(tr)
            // const tdTotal = document.createElement('td')
            // tdTotal.innerHTML = `<span>Total</span>: `
            // tr.appendChild(tdTotal)
            // const tdPrice = document.createElement('td')
            // tdPrice.innerHTML = `$${sum}`
            // tr.appendChild(tdPrice)
            // // purchased-ticket-content-container
            // const purchasedTicketContentContainer = document.createElement('div')
            // purchasedTicketContentContainer.classList.add('purchased-ticket-content-container')
            // purchasedTicket.appendChild(purchasedTicketContentContainer)
            // const purchasedTicketContent = document.createElement('div')
            // purchasedTicketContent.classList.add('purchased-ticket-content')
            // purchasedTicketContentContainer.appendChild(purchasedTicketContent)
            // const colWrapper = document.createElement('div')
            // colWrapper.classList.add('col_wrapper')
            // purchasedTicketContent.appendChild(colWrapper)
            // const row = document.createElement('div')
            // row.classList.add('row')
            // colWrapper.appendChild(row)
            // const col3 = document.createElement('div')
            // col3.classList.add('col-3')
            // col3.innerText = "img"
            // row.appendChild(col3)
            // const col9 = document.createElement('div')
            // col9.classList.add('col-9')
            // row.appendChild(col9)
            // const colSpacing = document.createElement('div')
            // colSpacing.classList.add('col-spacing')
            // col9.appendChild(colSpacing)
            // const purchasedTicketItem = document.createElement('div')
            // purchasedTicketItem.classList.add('purchased-ticket-item')
            // colSpacing.appendChild(purchasedTicketItem)
            // // Table
            // const table2 = document.createElement('table')
            // purchasedTicketItem.appendChild(table2)
            // const tbody2 = document.createElement('tbody')
            // table2.appendChild(tbody2)
            // const tr2 = document.createElement('tr')
            // tbody2.appendChild(tr2)
            // const tdOrganiser = document.createElement('td')
            // tdOrganiser.innerHTML = `<span>Organiser</span>: `
            // tr2.appendChild(tdOrganiser)
            // const tdOrganiserName = document.createElement('td')
            // tdOrganiserName.innerHTML = `<span>${recordItem.organiser_name}</span> `
            // tr2.appendChild(tdOrganiserName)
            // const tr3 = document.createElement('tr')
            // tbody2.appendChild(tr3)
            // const tdEvent = document.createElement('td')
            // tdEvent.innerHTML = `<span>Event Name</span>: `
            // tr3.appendChild(tdEvent)
            // const tdEventName = document.createElement('td')
            // tdEventName.innerHTML = `<span>${recordItem.show_name}</span> `
            // tr3.appendChild(tdEventName)
            // const tr4 = document.createElement('tr')
            // tbody2.appendChild(tr4)
            // const tdQuan = document.createElement('td')
            // tdQuan.innerHTML = `<span>Quantity</span>: `
            // tr4.appendChild(tdQuan)
            // const tdQuantity = document.createElement('td')
            // tdQuantity.innerHTML = `<span>${recordItem.quantity}</span> `
            // tr4.appendChild(tdQuantity)
            // const tr5 = document.createElement('tr')
            // tbody2.appendChild(tr5)
            // const tdPriceTitle = document.createElement('td')
            // tdPriceTitle.innerHTML = `<span>Price</span>: `
            // tr5.appendChild(tdPriceTitle)
            // const tdPricing = document.createElement('td')
            // tdPricing.innerHTML = `<span>${sum}</span> `
            // tr5.appendChild(tdPricing)
            // const tr6 = document.createElement('tr')
            // tbody2.appendChild(tr6)
            // const tdVenueTitle = document.createElement('td')
            // tdVenueTitle.innerHTML = `<span>Venue</span>: `
            // tr6.appendChild(tdVenueTitle)
            // const tdVenue = document.createElement('td')
            // tdVenue.innerHTML = `<span>${recordItem.venue}</span> `
            // tr6.appendChild(tdVenue)
            // const tr7 = document.createElement('tr')
            // tbody2.appendChild(tr7)
            // const tdStartTime = document.createElement('td')
            // tdStartTime.innerHTML = `<span>Start Time</span>: `
            // tr7.appendChild(tdStartTime)
            // const tdEventDate = document.createElement('td')
            // tdEventDate.innerHTML = `<span>${showDateFormatDate}, ${showDateFormatTime}</span> `
            // tr7.appendChild(tdEventDate)
        }
    }
}

init()

function dateFormater(dateObject, timeOnlyBoolean = false) {
    let returningString;
    if (timeOnlyBoolean == true) {
        returningString = `${dateObject.getHours() < 10 ? '0' + JSON.stringify(dateObject.getHours()) : JSON.stringify(dateObject.getHours())}:${dateObject.getMinutes() < 10 ? '0' + JSON.stringify(dateObject.getMinutes()) : JSON.stringify(dateObject.getMinutes())}`
    } else {
        returningString = `${dateObject.getDate()}/${dateObject.getMonth() + 1}/${dateObject.getFullYear() - 2000} ${dateObject.getHours() < 10 ? '0' + JSON.stringify(dateObject.getHours()) : JSON.stringify(dateObject.getHours())}:${dateObject.getMinutes() < 10 ? '0' + JSON.stringify(dateObject.getMinutes()) : JSON.stringify(dateObject.getMinutes())}`
    }
    console.log("returning string: ", returningString);
    return returningString
}