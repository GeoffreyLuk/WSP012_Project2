let show = document.URL.split('/').pop();

// set up variables for tickets,discounts,and show dates
//tickets
const ticket = document.querySelector('#ticket');
let ticketCounter = 1;
const tickets = {};
//show dates
const date = document.querySelector('#show_dates');
let dateCounter = 1;
const dates = {};
//discounts
const discount = document.querySelector('#discount');
let discountCounter = 1;
const discounts = {};


window.onload = () => {
  let data = loadingData()
  if (show == 'show_new') {
    //use post
  } else {
    //use put
  };
};

async function loadingData() {
  const res = await fetch(`/get/${show}`);

  const result = await res.json();
  console.log(result)
  return result
}

//tickets
function addingTickets() {
  console.log('adding tickets')
  let newTicket = {};
  newTicket['name'] = ''
  newTicket['price'] = null
  newTicket['quantity'] = null
  tickets[`${ticketCounter}new`] = newTicket


  ticket.innerHTML += `
    <div id="ticket_${ticketCounter}new" class="ticket_container">
                <div id="ticket_${ticketCounter}new_delete" class="ticket_button ticket_delete">delete ticket type</div><br>
                <input type="text" id="ticket_type_${ticketCounter}new" name="ticket_type_${ticketCounter}new"><label for="ticket_type_${ticketCounter}new">Ticket Type Name</label><br>
                <input type="number" id="ticket_price_${ticketCounter}new" name="ticket_price_${ticketCounter}new"><label for="ticket_price_${ticketCounter}new">Ticket price</label><br>
                <input type="number" id="ticket_quantity_${ticketCounter}new" name="ticket_quantity_${ticketCounter}new"><label for="ticket_quantity_${ticketCounter}new">Max Quantity</label>
            </div><br>

    `

  ticketCounter += 1
}

function deletingTickets(target) {
  let string = `ticket_${target}`
  if (string in tickets) {
    console.log('tickets before deletion: ', tickets)
    delete tickets[string]
    console.log('tickets after deletion: ', tickets)
  } else { console.log('key not found') }
}

function loadingTickets() {
  ticket.innerHTML = ''
  for (let keys in tickets) {
    console.log('key being printed: ', keys)
    ticket.innerHTML += `
    <div id="ticket_${keys}" class="ticket_container">
                <div id="ticket_${keys}_delete" class="ticket_button ticket_delete">delete ticket type</div><br>
                <input type="text" id="ticket_type_${keys}" name="ticket_type_${keys}" value="${tickets[keys]['name']}"><label for="ticket_type_${keys}">Ticket Type Name</label><br>
                <input type="number" id="ticket_price_${keys}" name="ticket_price_${keys}" value="${tickets[keys]['price']}"><label for="ticket_price_${keys}">Ticket price</label><br>
                <input type="number" id="ticket_quantity_${keys}" name="ticket_quantity_${keys}" value="${tickets[keys]['quantity']}"><label for="ticket_quantity_${keys}">Max Quantity</label>
            </div><br>

    `
  }
}

//dates
function addingDates() {
  console.log('adding dates')
  let newDate = {};
  newDate['time'] = null
  dates[`${dateCounter}new`] = newDate


  date.innerHTML += `
   <div id="date_${dateCounter}new" class="date_container">
   <div id="date_${dateCounter}new_delete" class="date_button date_delete">delete date</div><br>
   <input type="datetime-local" name="date_sample_date" id="${dateCounter}new_date"><label for="${dateCounter}new_date">Timeslot ${dateCounter}</label><br>
</div>

    `

  dateCounter += 1
}

function deletingDates(target) {
  let string = `date_${target}`
  if (string in dates) {
    console.log('dates before delete: ', dates)
    delete dates[string]
    console.log('dates after delete: ', dates)
  } else { console.log('key not found') }
}

function loadingDates() {
  date.innerHTML = ''
  for (let keys in dates) {
    console.log('keys being printed', keys)
    date.innerHTML += `
  <div id="date_${keys}" class="date_container">
   <div id="date_${keys}_delete" class="date_button date_delete">delete date</div><br>
   <input type="datetime-local" name="date_sample_date" id="${keys}_date" value="${dates[keys]['time']}"><label for="${keys}_date">Timeslot ${keys}</label><br>
</div>

  `
  }
}

//discounts
function addingDiscounts() {
  console.log('adding discounts')
  let newDiscount = {};
  newDiscount['name'] = null
  newDiscount['amount'] = null
  discounts[`${discountCounter}new`] = newDiscount


  discount.innerHTML += `
  <div id="discount_${discountCounter}new" class="discount_container">
  <div id="discount_${discountCounter}new_delete" class="discount_button discount_delete">Delete discount type</div><br>
  <input type="text" id="discount_${discountCounter}new_name" name="discount_${discountCounter}new_name"><label for="discount_${discountCounter}new_name">New Discount ${discountCounter}</label><br>
  <input type="number" id="discount_${discountCounter}new_amount" name="discount_${discountCounter}new_amount"><label for="discount_${discountCounter}new_amount">Discount Amount</label><br>
</div>

    `

  discountCounter += 1
}

function deletingDiscounts(target) {
  let string = `discount_${target}`
  if (string in discounts) {
    console.log('discounts before delete: ', discounts)
    delete discounts[string]
    console.log('discounts after delete: ', discounts)
  } else { console.log('key not found') }
}

function loadingDiscounts() {
  discount.innerHTML = ''
  for (let keys in discounts) {
    console.log('keys being printed', keys)
    discount.innerHTML += `
    <div id="discount_${keys}" class="discount_container">
    <div id="discount_${keys}_delete" class="discount_button discount_delete">Delete discount type</div><br>
    <input type="text" id="discount_${keys}_name" name="discount_${keys}_name" value="${discounts[keys]['name']}"><label for="discount_${keys}_name">${keys}</label><br>
    <input type="number" id="discount_${keys}_amount" name="discount_${keys}_amount" value="${discounts[keys]['amount']}"><label for="discount_${keys}_amount">Discount Amount</label><br>
  </div>

  `
  }
}

// control add and delete
document.querySelector('#uploading_show').addEventListener('click', (e) => {
if (e.target.matches('#ticket_add')) {
    console.log('ticket add has been clicked')
    addingTickets()
  }else if (e.target.matches('#date_add')) {
    console.log('date add has been clicked')
    addingDates()
  }else if (e.target.matches('#discount_add')){
    console.log('discount add has been clicked')
    addingDiscounts()
  }
})

document.querySelector('#uploading_show').addEventListener('click', (e) => {
  if (e.target.matches('.ticket_delete')){
    deleting(e.target.id)
  }else if (e.target.matches('.date_delete')){
    deleting(e.target.id)
  }else if(e.target.matches('.discount_delete')){
    deleting(e.target.id) 
}})


function deleting(terminated) {
  console.log(terminated)
  let target = terminated.split('_')
  target.pop()
  let final = target.join('_')
  document.getElementById(final).outerHTML = ""
}
