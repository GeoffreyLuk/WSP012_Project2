let loginFormElm = document.querySelector('.login-form-container > form')

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
        Notiflix.Notify.failure(`Invalid Email/ Password.`)
        return
    }

    let data = await res.json()
    console.log("data: ", data);
    console.log("first_name", data.first_name);
    window.location = '/'
})