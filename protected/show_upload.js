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

//constants for all input values
//for CKEDITOR
const showContentContainer = document.querySelector('#show_description_container')
const textArea = document.createElement('textarea')
textArea.value = `<h2><strong>Write your show descriptors here!&nbsp;</strong></h2><p><br data-cke-filler="true"></p><p>Feel free to edit however you like~</p><p><br data-cke-filler="true"></p><p>Have a step-by-step Marketing Campaign?</p><ol><li>We got you covered</li><li>Let your fans follow along easily</li></ol><p>Have rules and regulations in the fine print?</p><ul><li>List them all out here.</li></ul><h4>Make use of different headings to separate content</h4><p>Good luck, and launch your show now!</p>`

//for document
const docPublished = document.querySelector('#published');
const docImagePreview = document.querySelector('#image_preview');
const docShowBanner = document.querySelector('#show_banner');
const docShowDetails = document.querySelector('#show_details');
const docShowName = document.querySelector('#show_name');
const docShowDuration = document.querySelector('#show_duration');
const docSalesStart = document.querySelector('#sales_start_date');
const docSalesEnd = document.querySelector('#sales_end_date');
const docCategory = document.querySelector("#category_container input[type='radio'][checked]");
const docCategoryAdd = document.querySelector('#form_check_add');
const docVenueName = document.querySelector('#venue_name');
const docVenueLocation = document.querySelector('#location');
const docShowContent = document.querySelector('#show_description_container .ck-editor__editable');
const docEarlyBirdDiscount = document.querySelector('#discount_earlyBird_toggle');
const docEarlyBirdEnd = document.querySelector('#earlyBird_end_date');
const docEarlyBirdAmount = document.querySelector('#earlyBird_amount')


//on load logic
window.onload = async () => {
  docShowBanner.addEventListener('change',previewImage)

  if (show == 'show_new') {
    await loadingData(false)
    renderCKEDITOR()
    //use post
  } else {
    await loadingData(true)
    existingShow()
    renderCKEDITOR()
    //use put
  };
};

function existingShow() {

  //throw into the following constants
  // tickets
  // dates 
  // discounts


  loadingDates()
  loadingTickets()
  loadingDiscounts()

}

//logics

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
                <input type="number" id="ticket_quantity_${ticketCounter}new" name="ticket_quantity_${ticketCounter}new"><label for="ticket_quantity_${ticketCounter}new">Max Quantity</label><br>
            </div>

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
                <input type="text" id="ticket_type_${keys}" name="ticket_type_${keys}" value="${keys}"><label for="ticket_type_${keys}">Ticket Type Name</label><br>
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
  let count = 1
  date.innerHTML = ''
  for (let keys in dates) {
    console.log('keys being printed', keys)
    date.innerHTML += `
  <div id="date_${keys}" class="date_container">
   <div id="date_${keys}_delete" class="date_button date_delete">delete date</div><br>
   <input type="datetime-local" name="date_sample_date" id="${keys}_date" value="${datetimeLocal(dates[keys])}"><label for="${keys}_date">Timeslot ${count}</label><br>
</div>

  `
  count ++
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
    <input type="text" id="discount_${keys}_name" name="discount_${keys}_name" value="${keys}"><label for="discount_${keys}_name">${keys}</label><br>
    <input type="number" id="discount_${keys}_amount" name="discount_${keys}_amount" value="${discounts[keys]}"><label for="discount_${keys}_amount">Discount Amount</label><br>
  </div>

  `
  }
}

//categories
function addingCategories(returningCategory) {
  for (keys in returningCategory) {
    docCategoryAdd.innerHTML += `
  <div class="form-check">
                        <input class="form-check-input" type="radio" name="category_selection" id="${returningCategory[keys]}"
                            value="${returningCategory[keys]}">
                        <label class="form-check-label" for="${returningCategory[keys]}">
                        ${returningCategory[keys]}
                        </label>
                    </div>
  `
  }
}

// control add and delete
document.querySelector('#uploading_show').addEventListener('click', (e) => {
  if (e.target.matches('#ticket_add')) {
    console.log('ticket add has been clicked')
    addingTickets()
  } else if (e.target.matches('#date_add')) {
    console.log('date add has been clicked')
    addingDates()
  } else if (e.target.matches('#discount_add')) {
    console.log('discount add has been clicked')
    addingDiscounts()
  }
})

document.querySelector('#uploading_show').addEventListener('click', (e) => {
  if (e.target.matches('.ticket_delete')) {
    deleting(e.target.id)
  } else if (e.target.matches('.date_delete')) {
    deleting(e.target.id)
  } else if (e.target.matches('.discount_delete')) {
    deleting(e.target.id)
  }
})

function deleting(terminated) {
  console.log(terminated)
  let target = terminated.split('_')
  target.pop()
  let final = target.join('_')
  document.getElementById(final).outerHTML = ""
}

function previewImage(event) {
  const [file] = event.target.files;
  if (file) {
      docImagePreview.src =
          URL.createObjectURL(file);
  }}

//functions for controlling action
async function loadingData(update) {
  const res = await fetch(`/get/${show}`);
  dataResult = await res.json();

  addingCategories(dataResult['categories'])


  if (update != true){
  
  }else {
    //published
    dataResult['data']['published'] ? docPublished.checked = true : ''

    //pictures
    async function switchImage() {
      const res = await fetch(
        `/assets/organisations/${dataResult['data']['details']['banner']}`
      );
      const result = await res.blob();
      const objectURL = URL.createObjectURL(result);
      docImagePreview.src = objectURL;
    }
    switchImage()

    //Mandatory Data
    docShowDetails.value = dataResult['data']['details']['description']
    docShowName.value = dataResult['data']['show_name']
    docShowDuration.value = dataResult['data']['show_duration']
    docSalesStart.value = datetimeLocal(dataResult['data']['sales_start_date'])
    docSalesEnd.value = datetimeLocal(dataResult['data']['sales_end_date'])


    //category
    document.querySelector(`#${dataResult['categories'][dataResult['data']['category_id']]}`).checked = true

    //location
    docVenueName.value = dataResult['locations'][dataResult['shows_locations']['location_id']]['venue']
    docVenueLocation.value = dataResult['locations'][dataResult['shows_locations']['location_id']]['address']
    

    //show Content
    textArea.value = dataResult['data']['details']['content']

    //show Dates & ticket types
    for (let values of dataResult['tickets']['uniqueDates']){
      dates[values.show_date] = values.show_date
    }
    for (let values of dataResult['tickets']['uniqueTypes']){
      tickets[values.type] = {price: values.pricing , quantity: values.max_quantity }
    }

    //discounts
    if (dataResult['data']['ticket_discount']['early_discount']){
      docEarlyBirdDiscount.checked = true
      docEarlyBirdEnd.value = datetimeLocal(dataResult['data']['ticket_discount']['discount_amount'])
      docEarlyBirdAmount.value = dataResult['data']['ticket_discount']['early_date']
    }
    let otherDiscount = dataResult['data']['ticket_discount']['other_discount']
    for (key in otherDiscount){
      discounts[key] = otherDiscount[key]
    }
    loadingDiscounts()
  }

}


function datetimeLocal(datetime) {
  const dt = new Date(datetime);
  dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
  return dt.toISOString().slice(0, 16);
}


//ckeditor placed after loading data
function renderCKEDITOR(){
showContentContainer.append(textArea)
ClassicEditor
  .create(textArea, {
    removePlugins: ['Autoformat', 'BlockQuote', 'CKBox', 'CKFinder', 'CloudServices', 'EasyImage', 'Image', 'ImageCaption', 'ImageStyle', 'ImageToolbar', 'ImageUpload', 'MediaEmbed', 'PasteFromOffice', 'PictureEditing', 'Table', 'TableToolbar'],
  })
  .catch(error => {
    console.log(error);
  });
}