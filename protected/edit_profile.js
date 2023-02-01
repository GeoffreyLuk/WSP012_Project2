let editFormElm = document.querySelector('.edit_profile_form')
let originalEmailElm = document.querySelector('.original_email')
let editFormItems = editFormElm.elements

async function getUserInfo() {
    let res = await fetch('/get_user_info')
    if (res.ok) {
        let user = await res.json()
        loadUserInfo(user)
    }
}

async function loadUserInfo(user) {
    let originalEmail = document.querySelector('.original_email')
    let firstName = document.querySelector('.first_name')
    let lastName = document.querySelector('.last_name')
    let phoneNumber = document.querySelector('.phoneNumber')
    originalEmail.innerHTML = user.email
    firstName.value = user.first_name
    lastName.value = user.last_name
    if (user.phone_number) {
        phoneNumber.value = user.phone_number
    }
}

async function init() {
    getUserInfo()
}

function ValidateEmail(item) {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(item.value)) {
        return true
    }
    return false
}

// Check if there's update of email
function checkNewEmail(item) {
    if (!(editFormElm.newEmail.value == "") || !(editFormElm.confirmEmail.value == "")) {
        ValidateEmail(item)
        if (editFormElm.newEmail.value == editFormElm.confirmEmail.value) {
            emailData = editFormElm.newEmail.value
            return true
        } else {
            Notiflix.Notify.failure("Please Enter Correct Email Address")
            return false
        }
    } else {
        emailData = originalEmailElm.innerHTML
        return true
    }
}

function checkIfEmpty() {
    for (let item of editFormItems) {
        if (item.type == "email") {
            if (!checkNewEmail(item)) {
                return false
            }
        } else if (!item.value && item.type != "checkbox") {
            Notiflix.Notify.failure(`${item.placeholder} is empty`)
            return false
            // Check if the checkbox is true
        } else if (item.type == "checkbox") {
            if (!editFormElm.elements.agree.checked) {
                Notiflix.Notify.failure(`Please Confirm Before Submit`)
                return false
            }
        }
    }
    return true
}

editFormElm.addEventListener('submit', async (e) => {
    e.preventDefault()
    // Validation
    if (checkIfEmpty()) {

        // prep
        let uploadData = {
            newEmail: editFormElm.newEmail.value,
            email: emailData,
            firstName: editFormElm.first_name.value,
            lastName: editFormElm.last_name.value,
            phoneNumber: editFormElm.phone_number.value
        }
        // send
        let res = await fetch('/update_user_info', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(uploadData)
        })
        // post handling

        if (!res.ok) {
            Notiflix.Notify.failure(`Edit Profile Failed.`)
            return
        }

        let data = await res.json()
        console.log(data);
        window.location = '/'
    }
})
init()