let loginFormElm = document.querySelector('.login-form > form')

loginFormElm.addEventListener('submit', async (e) => {
    e.preventDefault()
    let loginData = {
        email: loginFormElm.email.value,
        password: loginFormElm.password.value
    }

    let res = await fetch('/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(loginData)
    })

    if (!res.ok) {
        return
    }

    let data = res.json()
    console.log("data: ", data);
    // window.location = '/404.html'
})