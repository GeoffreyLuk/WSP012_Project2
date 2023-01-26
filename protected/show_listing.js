const newListContainer = document.querySelector('#list_new')
const publishedListContainer = document.querySelector('#list_published')
const unpublishedListContainer = document.querySelector('#list_unpublished')
const mainContainer = document.querySelector('#main')
const formData = {};


window.onload = () => {
    loadingData()
}


async function loadingData() {
    const res = await fetch(`/organisation`)
    const result = await res.json();
    newListContainer.innerHTML += `
        <div class='show_link' id="show_new">New Show</div><br>
        `

    console.log(result)

    result.shows.forEach(element => {
        let content = `
        <div class='show_link' id="show_${element.id}">${element.show_name}</div><br>
        `
        if (element.published == true) {
            publishedListContainer.innerHTML += content
        } else if (element.published == false) {
            unpublishedListContainer.innerHTML += content
        } else { console.log('error with code') }

    })
}

mainContainer.addEventListener('click', async (e) => {
    console.log('target: ',e.target)
    if (e.target.matches('.show_link')){
        window.location = `/organisation/${e.target.id}`
        
    }
});