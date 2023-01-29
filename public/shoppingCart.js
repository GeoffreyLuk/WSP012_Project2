let show = document.URL.split('/show_').pop()

async function init() {
    console.log("init()");
    loadCheckout()
}

async function loadCheckout() {
    let res = await fetch(`get_checkout/${show}`)
    if (res.ok) {
        let data = await res.json()
        console.log("data: ", data);
    }
}


init()