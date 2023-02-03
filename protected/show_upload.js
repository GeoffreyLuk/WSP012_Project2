let show = document.URL.split('/').pop();

// set up variables for tickets,discounts,and show dates
//tickets
const ticket = document.querySelector('#ticket');
let ticketCounter = 1;
const tickets = {};
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
let publishedIsTrue = false
let earlyBirdIsTrue = false
const uploadForm = document.querySelector('#uploading_show')
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
const docEarlyBirdDiscount = document.querySelector('#discount_earlyBird_toggle');
const docEarlyBirdEnd = document.querySelector('#earlyBird_end_date');
const docEarlyBirdAmount = document.querySelector('#earlyBird_amount')

//on load logic
window.onload = async () => {
  docShowBanner.addEventListener('change', previewImage)

  if (show == 'show_new') {
    await loadingData(false)
    // renderCKEDITOR()
    //use post
    uploadForm.addEventListener('submit', async (e) => { await submitAction(e, 'POST') })

  } else {
    await loadingData(true)
    existingShow()
    // renderCKEDITOR()

    //use put
    uploadForm.addEventListener('submit', async (e) => { await submitAction(e, 'PUT') })
  };
  renderCKEDITOR()

};

async function existingShow() {

  //throw into the following constants
  // tickets
  // dates 
  // discounts


  loadingTickets()
  loadingDiscounts()

}

//logics

//tickets
function addingTickets() {
  console.log('adding tickets')
  let newTicket = {};
  newTicket['name'] = `${ticketCounter}`
  newTicket['type'] = ''
  newTicket['price'] = 0
  newTicket['quantity'] = 0
  tickets[`new/${ticketCounter}`] = newTicket


  ticket.innerHTML += `
    <div id="ticket_new/${ticketCounter}" class="ticket_container">
                <div id="ticket_new/${ticketCounter}_delete" class="ticket_button ticket_delete">delete ticket type</div><br>
                <input type="datetime-local" id="ticket_date_new/${ticketCounter}" name="ticket_date_new/${ticketCounter}"><label for="ticket_date_new/${ticketCounter}">Ticket date</label><br>
                <input type="text" id="ticket_type_new/${ticketCounter}" name="ticket_type_new/${ticketCounter}"><label for="ticket_type_new/${ticketCounter}">Ticket type name</label><br>
                <input type="number" id="ticket_price_new/${ticketCounter}" name="ticket_price_new/${ticketCounter}"><label for="ticket_price_new/${ticketCounter}">Ticket price</label><br>
                <input type="number" id="ticket_quantity_new/${ticketCounter}" name="ticket_quantity_new/${ticketCounter}"><label for="ticket_quantity_new/${ticketCounter}">Max quantity</label><br>
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
    ticket.innerHTML += `
    <div id="ticket_${keys}" class="ticket_container">
                <div id="ticket_${keys}_delete" class="ticket_button ticket_delete">delete ticket type</div><br>
                <input type="datetime-local" id="ticket_date_${keys}" name="ticket_date_${keys}" value="${datetimeLocal(tickets[keys]['show_date'])}"><label for="ticket_date_${keys}">Ticket date</label><br>
                <input type="text" id="ticket_type_${keys}" name="ticket_type_${keys}" value="${tickets[keys]['type']}"><label for="ticket_type_${keys}">Ticket type name</label><br>
                <input type="number" id="ticket_price_${keys}" name="ticket_price_${keys}" value="${tickets[keys]['price']}"><label for="ticket_price_${keys}">Ticket price</label><br>
                <input type="number" id="ticket_quantity_${keys}" name="ticket_quantity_${keys}" value="${tickets[keys]['quantity']}"><label for="ticket_quantity_${keys}">Max quantity</label><br>
            </div><br>

    `
  }
}

//discounts
function addingDiscounts() {
  console.log('adding discounts')
  let newDiscount = {};
  newDiscount['name'] = null
  newDiscount['amount'] = null
  discounts[`new/${discountCounter}`] = newDiscount


  discount.innerHTML += `
  <div id="discount_new/${discountCounter}" class="discount_container">
  <div id="discount_new/${discountCounter}_delete" class="discount_button discount_delete">Delete discount type</div><br>
  <input type="text" id="discount_new/${discountCounter}_name" name="discount_new/${discountCounter}_name"><label for="discount_new/${discountCounter}_name">New Discount ${discountCounter}</label><br>
  <input type="number" id="discount_new/${discountCounter}_amount" name="discount_new/${discountCounter}_amount"><label for="discount_new/${discountCounter}_amount">Discount Amount</label><br>
</div>
<br>

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
uploadForm.addEventListener('click', (e) => {
  if (e.target.matches('#ticket_add')) {
    console.log('ticket add has been clicked')
    addingTickets()
  } else if (e.target.matches('#discount_add')) {
    console.log('discount add has been clicked')
    addingDiscounts()
  }
})

uploadForm.addEventListener('click', (e) => {
  if (e.target.matches('.ticket_delete')) {
    deleting(e.target.id)
  } else if (e.target.matches('.discount_delete')) {
    deleting(e.target.id)
  } else if (e.target.matches('#clear_files')) {
    docShowBanner.value = ''
    docImagePreview.src = ''
  }
})

uploadForm.addEventListener('click', (e) => {
  if (e.target.matches('.form-check-input[name="category_selection"]')) {
    console.log(e.target)
    document.querySelectorAll('.form-check-input[name="category_selection"]').forEach((element) => {
      element.removeAttribute('checked')
    })
    e.target.setAttribute('checked', 'true')
  }
})

docPublished.addEventListener('click', (e) => {
  publishedIsTrue = !publishedIsTrue
  publishedChecked()
})

docEarlyBirdDiscount.addEventListener('click', (e) => {
  earlyBirdIsTrue = !earlyBirdIsTrue
  earlyBirdChecked()
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
  }
}

//functions for controlling action
function publishedChecked() {
  if (publishedIsTrue) {
    docPublished.setAttribute('checked', 'true')
  } else {
    docPublished.removeAttribute('checked')
  }
}

function earlyBirdChecked() {
  if (earlyBirdIsTrue) {
    docEarlyBirdDiscount.setAttribute('checked', 'true')
  } else {
    docEarlyBirdDiscount.removeAttribute('checked')
  }
}

function datetimeLocal(datetime) {
  const dt = new Date(datetime);
  dt.setMinutes(dt.getMinutes() - dt.getTimezoneOffset());
  return dt.toISOString().slice(0, 16);
}

function pulling(section, target = 'input') {

  let test = document.querySelector(section)
  let innerTest = test.querySelectorAll(target)
  return innerTest
}

async function loadingData(update) {
  const res = await fetch(`/get/${show}`);

  if (!res.ok) {
    Notiflix.Notify.failure(finalResult['message'])
    return
  } else {

    dataResult = await res.json();

    addingCategories(dataResult['categories'])


    if (update != true) {

    } else {
      //published
      publishedIsTrue = dataResult['data']['published']
      publishedChecked()

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
      document.querySelector(`#${dataResult['categories'][dataResult['data']['category_id']]}`).setAttribute('checked', 'true')

      //location
      docVenueName.value = dataResult['locations'][dataResult['shows_locations']['location_id']]['venue']
      docVenueLocation.value = dataResult['locations'][dataResult['shows_locations']['location_id']]['address']


      //show Content
      textArea.value = dataResult['data']['details']['content']

      //ticket types
      for (let values of dataResult['tickets']) {
        tickets[`existingTicket/${values.id}`] = { type: values.type, price: values.pricing, quantity: values.max_quantity, show_date: values.show_date }
      }

      //discounts
      earlyBirdIsTrue = dataResult['data']['ticket_discount']['early_discount']
      earlyBirdChecked()
      if (earlyBirdIsTrue) {
        docEarlyBirdDiscount.setAttribute('checked', 'true')
        docEarlyBirdEnd.value = datetimeLocal(dataResult['data']['ticket_discount']['early_date'])
        docEarlyBirdAmount.value = dataResult['data']['ticket_discount']['discount_amount']
      } else {

      }
      let otherDiscount = dataResult['data']['ticket_discount']['other_discount']
      for (key in otherDiscount) {
        discounts[key] = otherDiscount[key]
      }
      loadingDiscounts()
    }
  }

}

async function submitAction(e, para) {
  e.preventDefault()
  const form = e.target;
  const formData = new FormData(form);

  let groupedData = {}

  //show id
  if (e = 'put') {
    groupedData['showID'] = dataResult.data.id
  }

  //published
  groupedData['publishedData'] = publishedIsTrue
  //banner
  groupedData['bannerData'] = form.banner.files[0] ? form.banner.files[0].name : ''
  //mandatory
  groupedData['mandatoryData'] = {
    description: form.details.value,
    title: form.name.value,
    show_duration: form.show_duration.value,
    sales_start_date: form.sales_start_date.value,
    sales_end_date: form.sales_end_date.value
  }
  //categories
  groupedData['categoriesData'] = pulling('#con3', '[checked=true]')[0].value
  groupedData['new_category'] = document.querySelector('#new_category_text').value
  //locations
  groupedData['locationData'] = {
    venue: form.venue_name.value,
    location: form.location.value
  }
  //show content
  groupedData['showContentData'] = document.querySelector('.ck-editor__editable_inline').innerHTML
  //tickets
  let ticketsData = {}
  pulling('#con6', '.ticket_container').forEach((element) => {
    let trueID = element.id.split('_').pop()
    ticketsData[trueID] = {
      show_date: pulling('#con6', `input[id*="${trueID}"]`)[0].value,
      type: pulling('#con6', `input[id*="${trueID}"]`)[1].value,
      pricing: pulling('#con6', `input[id*="${trueID}"]`)[2].value,
      max_quantity: pulling('#con6', `input[id*="${trueID}"]`)[3].value
    }
  })
  groupedData['ticketsData'] = ticketsData

  //discounts
  let discountsData = {}
  let other_discount = {}
  pulling('#con7', '.discount_container').forEach((element) => {
    let trueID = element.id.split('_').pop()
    if (trueID != 'earlyBird') {
      other_discount[pulling('#con7', `input[id*="${trueID}"]`)[0].value] = pulling('#con7', `input[id*="${trueID}"]`)[1].value
    }
  })
  discountsData['early_date'] = form.earlyBird_end_date.value
  discountsData['discount_amount'] = form.earlyBird_amount.value
  discountsData['early_discount'] = earlyBirdIsTrue
  discountsData['other_discount'] = other_discount
  groupedData['discountsData'] = discountsData

  //groupedData into formData
  formData.append('groupedData', JSON.stringify(groupedData))


  const res = await fetch(`/upload/${show}`, {
    method: para,
    body: formData
  })

  const finalResult = await res.json()
  Notiflix.Notify.success(finalResult['message'])
}

//ckeditor placed after loading data
function renderCKEDITOR() {
  showContentContainer.append(textArea)
  ClassicEditor
    .create(textArea, {
      removePlugins: ['Autoformat', 'BlockQuote', 'CKBox', 'CKFinder', 'CloudServices', 'EasyImage', 'Image', 'ImageCaption', 'ImageStyle', 'ImageToolbar', 'ImageUpload', 'MediaEmbed', 'PasteFromOffice', 'PictureEditing', 'Table', 'TableToolbar'],
    })
    .catch(error => {
      console.log(error);
    });
}

