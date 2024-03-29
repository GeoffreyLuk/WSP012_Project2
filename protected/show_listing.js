const newListContainer = document.querySelector('#list_new')
const publishedListContainer = document.querySelector('#list_published')
const unpublishedListContainer = document.querySelector('#list_unpublished')
const mainContainer = document.querySelector('#main')
const formData = {};
const arrowheads = document.querySelectorAll('.arrowhead')
function resetArrowheads (){
    arrowheads.forEach(elem=>{
        elem.src = 'assets/default/sideways.png'
    })
}
const listings = document.querySelectorAll('.listings')


window.onload = async () => {
    await loadingData()
    listings.forEach(elem=>{
        elem.classList.add('d-none')
    })
}


async function loadingData() {
    const res = await fetch(`/organisation`)
    const result = await res.json();
    newListContainer.innerHTML += `
        <h3 class='show_link' id="show_new">New Show</h3><br>
        `

    result.shows.forEach(element => {
        let content = `
        <h3 class='show_link' id="show_${element.id}">${element.show_name}</h3><br>
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
        
    }else if(e.target.matches('.listings')){
        document.querySelectorAll('.listings').forEach(elem =>{
            elem.classList.add('d-none')
        })
        resetArrowheads()
        document.querySelector(`img[for="${e.target}"`).src='assets/default/downward.png'
        e.target.classList.remove('d-none')
    }else if(e.target.matches('.title')){
        let target = e.target.getAttribute('for')
        document.querySelectorAll('.listings').forEach(elem =>{
            elem.classList.add('d-none')
        })
        resetArrowheads()
        document.querySelector(`img[for="${target}"`).src='assets/default/downward.png'
        document.querySelector(`#${target}`).classList.remove('d-none')
    }else if (e.target.matches('.arrowhead')){
        let target = e.target.getAttribute('for')
        document.querySelectorAll('.listings').forEach(elem =>{
            elem.classList.add('d-none')
        })
        resetArrowheads()
        document.querySelector(`#${target}`).classList.remove('d-none')
        document.querySelector(`img[for="${target}"`).src='assets/default/downward.png'
    }
});