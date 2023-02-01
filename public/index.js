let dataResult;

let filter_date_target = 'Upcoming';
let filter_category_target = '*'
const showContainer = document.querySelector('#show_container')
const buttonContainer = document.querySelector('#button_containers')
const dateToggleContainer = document.querySelector('#date_toggle_containers')
const trueButtonContainer = document.querySelector('.filters-button-group')

// const socket = io.connect();
// socket.on('greeting', (data) => {
//     alert(data)
// })
window.onload = async () => {
    await getAllShows(filter_date_target)
    let allShowsDetails = dataResult['allShows']
    loadingButtons()
    loadingShows(allShowsDetails)
}

trueButtonContainer.addEventListener('click', async (e) => {
    if (e.target.matches('.filter')) {
        if (e.target.classList.contains('filter_date')) {
            filter_date_target = e.target.getAttribute('data-filter');
            console.log(filter_date_target);
            document.querySelectorAll('.filter_date').forEach((elem) => {
                elem.classList.remove('active')
            })
            document.querySelector(`.filter_date[data-filter="${filter_date_target}"]`).classList.add('active')
        }

        if (e.target.classList.contains('filter_category')) {
            filter_category_target = e.target.getAttribute('data-filter');
        }

        if (filter_category_target == '*') {
            await getAllShows(filter_date_target)
            let allShowsDetails = dataResult['allShows']
            loadingShows(allShowsDetails)
        } else {
            await getSelectShows(filter_category_target, filter_date_target)
            let allShowsDetails = dataResult['allShows']
            loadingShows(allShowsDetails)
        }
    }
})

async function main() {
    await getUserInfo()

}

main()

async function getUserInfo() {
    let res = await fetch('/get_user_info')
    if (res.ok) {
        let user = await res.json()
    }
}

async function getAllShows(param) {
    let res = await fetch('/get_all_shows', {
        method: "Post",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ range: param })
    })
    if (res.ok) {
        let forExtraction = await res.json()
        dataResult = forExtraction
    }
}

async function getSelectShows(target, param) {
    let res = await fetch(`/filter?category=${target}`, {
        method: "Post",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ range: param })
    })
    if (res.ok) {
        let forExtraction = await res.json()
        dataResult = forExtraction
    }
}

function loadingShows(shows) {
    showContainer.innerHTML = ''
    if (shows.length == 0){
        showContainer.innerHTML += `<h3 class="text-accent1 text-center">No Shows to Show</h3>`
    }else{
    for (let data of shows) {
        let launchDate = new Date(data['launch_date'])
        let endDate = new Date(data['end_date'])

        if (endDate < new Date()) {
            loader(data, launchDate, endDate, 'Previous')
        } else if (launchDate > new Date()) {
            loader(data, launchDate, endDate, 'Upcoming')
        } else if (launchDate < new Date() && new Date() < endDate) {
            loader(data, launchDate, endDate, 'Current')
        } else { console.log('error') }
    }
}


    function loader(parser, sd, ed, timeline = null) {
        if (timeline != null) {
            showContainer.innerHTML += `
            <div id="show_${parser['show_id']}" class="col-md-8 col-lg-4 shows" data-category="${dataResult['allCategories'][parser['category']]}">
                    <div class="card bg-container text-main">
                        <span class="badge bg-secondary time_badge ${timeline}">${timeline}</span>
                        <img src="/assets/organisations/${parser['details']['banner']}" class="${timeline}_img card-img-top img-fluid">
                        <div class="card-body">
                                <p class="ms-auto badge bg-accent2 categories">${dataResult['allCategories'][parser['category']]}</p>
                                <h5 class="card-title">${parser['show_name']}</h5>
                                <p class="card-subtitle mb-2 text-muted text-accent1">${parser['venue']}</p>
                                <p class="card-text">${dateFormater(sd, false)} - ${dateFormater(ed, false)}</p>
                        </div>
                    </div>
                </div>
            `;
        } else {
            showContainer.innerHTML += `
            <div id="show_${parser['show_id']}" col-md-8 col-lg-4 shows" data-category="${dataResult['allCategories'][parser['category']]}">
                    <div class="card bg-container text-main">
                        <img src="/assets/organisations/${parser['details']['banner']}" class="card-img-top img-fluid">
                        <div class="card-body">
                                <p class="ms-auto badge bg-accent2 categories">${dataResult['allCategories'][parser['category']]}</p>
                                <h5 class="card-title">${parser['show_name']}</h5>
                                <p class="card-subtitle mb-2 text-muted text-accent1">${parser['venue']}</p>
                                <p class="card-text">${dateFormater(sd, false)} - ${dateFormater(ed, false)}</p>
                        </div>
                    </div>
                </div>
            `;
        }

    }




}

function loadingButtons() {
    for (let keys in dataResult['allCategories']) {
        buttonContainer.innerHTML += `
        <button id="filter_${dataResult['allCategories'][keys]}" type="button" data-filter="${dataResult['allCategories'][keys]}" class="filter filter_category btn bg-accent2 text-main mx-2 btn-sm">${dataResult['allCategories'][keys]}</button>
    `
    }

}

showContainer.addEventListener('click', async (e) => {
    let showTargetID;
    if (e.target.parentElement.parentElement.matches('.shows')) {
        showTargetID = e.target.parentElement.parentElement.id
        window.location.replace(`http://localhost:8080/show_details/${showTargetID}`)
        const res = await fetch(`/show_details/${e.target.parentElement.parentElement.id}`);
    } else if (e.target.parentElement.parentElement.parentElement.matches('.shows')) {
        showTargetID = e.target.parentElement.parentElement.parentElement.id
        window.location.replace(`http://localhost:8080/show_details/${showTargetID}`)
    }
})

//iso init
let iso = new Isotope('.show_container', {
    itemSelector: '.shows',
    layoutMode: 'fitRows'
});

// bind filter button click
let filtersElem = document.querySelector('.filters-button-group');
filtersElem.addEventListener('click', function (event) {
    // only work with buttons
    if (!matchesSelector(event.target, 'button')) {
        return;
    }
    let filterValue = event.target.getAttribute('data-filter');
    // use matching filter function

    iso.arrange({ filter: 'abc' });
});

function dateFormater(dateObject, timeOnlyBoolean = false) {
    let returningString;
    if (timeOnlyBoolean == true) {
        returningString = `${dateObject.getHours() < 10 ? '0' + JSON.stringify(dateObject.getHours()) : JSON.stringify(dateObject.getHours())}:${dateObject.getMinutes() < 10 ? '0' + JSON.stringify(dateObject.getMinutes()) : JSON.stringify(dateObject.getMinutes())}`
    } else {
        returningString = `${dateObject.getDate()}/${dateObject.getMonth() + 1}/${dateObject.getFullYear() - 2000}`
    }
    return returningString
}

