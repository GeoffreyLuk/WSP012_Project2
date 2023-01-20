let resetPWFormElm = document.querySelector('.reset_PW_form')
let resetPWFormItems = resetPWFormElm.elements

async function getUserInfo() {
    let res = await fetch('/get_user_info')
    if (res.ok) {
        let user = await res.json()
        console.log(user);
    }
}

async function checkIfEmpty() {
    for (let item of resetPWFormItems) {
        if (!item.value && item.type != "checkbox") {
            alert(`${i.placeholder} is empty!`)
            return false
        }
    }
    return true
}

async function checkPWCorrect() {
    if (resetPWFormElm.old_PW.value == resetPWFormElm.new_PW.value) {
        return true
    } else {
        console.log("Incorrect new password, please try again");
        return false
    }
}

resetPWFormElm.addEventListener('submit', async (e) => {
    e.preventDefault()
    // Validation
    if (checkIfEmpty() && checkPWCorrect()) {
        // Prep
        let uploadData = {
            oldPassword: resetPWFormElm.old_PW.value,
            newPassword: resetPWFormElm.new_PW.value,
        }
        // send 
        let res = await fetch('/reset_PW', {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(uploadData)
        })

        // Post handling
        if (res.ok) {
            resetPWFormElm.reset()
        } else {
            console.log('Reset Password Failed')
        }
        let data = res.json()
        console.log(data);
        window.location = '/'
    }
})

async function init() {
    getUserInfo()
}

init()