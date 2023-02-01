
let signupformElm = document.querySelector('.signup-form')
let signupformItems = signupformElm.elements

function ValidateEmail() {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(signupformElm.email.value)) {
        return true
    }
    Notiflix.Notify.failure("Invalid Email input")
    return false
}

function checkIfEmpty() {
    for (let item of signupformItems) {
        if (item.type == "email") {
            if (!ValidateEmail()) {
                return false
            }
        } else if (!item.value && item.type != "file") {
            Notiflix.Notify.failure(`${item.placeholder} is empty!`)
            return false
        }
    }
    return true
}

signupformElm.addEventListener('submit', async (e) => {
    e.preventDefault()
    if (checkIfEmpty()) {
        let uploadData = new FormData(signupformElm)

        let res = await fetch('/signup', {
            method: 'POST',
            body: uploadData
        })

        if (res.ok) {
            Notiflix.Notify.success("Registration success! Welcome to G&G Tickets");
            signupformElm.reset()
            window.location = '/'
            return
        } else {
            // Notiflix.Notify.failure(`Email has already registered!`)
            return
        }
    } else {
        Notiflix.Notify.failure(`Registration failed!`)
        return
    }
})