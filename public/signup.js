
let signupformElm = document.querySelector('.signup-form')
let signupformItems = signupformElm.elements

function ValidateEmail() {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(signupformElm.email.value)) {
        return true
    }
    alert("Please input valid email")
    return false
}

function checkIfEmpty() {
    for (let item of signupformItems) {
        if (item.type == "email") {
            if (!ValidateEmail()) {
                return false
            }
        } else if (!item.value && item.type != "file") {
            alert(`${i.placeholder} is empty!`)
            return false
        }
    }
    return true
}

signupformElm.addEventListener('submit', async (e) => {
    e.preventDefault()
    if (checkIfEmpty()) {
        let uploadData = new FormData(signupformElm)

        // console.log("uploadData: ", uploadData);
        let res = await fetch('/signup', {
            method: 'POST',
            body: uploadData
        })
        // console.log("res: ", res)

        if (res.ok) {
            signupformElm.reset()
            return
        } else {
            console.log('register failed')
        }

        let data = res.json()
        console.log(data);
        // window.location = '/404.html'
    } else {
        return
    }
})