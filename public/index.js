// Hardcode
let show = "show_55"
let dataResult;


const showContainer = document.querySelector('#show_container')
const buttonContainer = document.querySelector('#button_containers')

// const socket = io.connect();
// socket.on('greeting', (data) => {
//     alert(data)
// })
window.onload = async () => {
    await getAllShows()
    console.log(dataResult)
    let allShowsDetails = dataResult['allShows']
    loadingButtons()
    loadingShows(allShowsDetails)
}


async function main() {
    await getUserInfo()

}

main()

async function getUserInfo() {
    let res = await fetch('/get_user_info')
    if (res.ok) {
        let user = await res.json()
        console.log("user:", user);
        console.log("user_name", user.first_name)
    }
}

async function getAllShows() {
    let res = await fetch('/get_all_shows')
    if (res.ok) {
        let forExtraction = await res.json()
        dataResult = forExtraction
    }
}

function loadingShows(shows) {

    function loader(parser,sd,ed) {
        showContainer.innerHTML += `
        <div id="show_${parser['show_id']}" class="col-md-3 shows" data-category="${dataResult['allCategories'][parser['category']]}">
                <div class="card">
                    <img src="/assets/organisations/${parser['details']['banner']}" class="card-img-top img-fluid">
                    <div class="card-body">
                            <p class="ms-auto badge bg-danger categories">${dataResult['allCategories'][parser['category']]}</p>
                            <h5 class="card-title">${parser['show_name']}</h5>
                            <p class="card-subtitle mb-2 text-muted">${parser['venue']}</p>
                            <p class="card-text">${sd.getDate()}/${sd.getMonth()}/${sd.getFullYear()} - ${ed.getDate()}/${ed.getMonth()}/${ed.getFullYear()}</p>
                    </div>
                </div>
            </div>
        `;
    }
    for (let data of shows) {
        let launchDate = new Date(data['launch_date'])
        let endDate = new Date(data['end_date'])

        if (endDate < new Date()) {
            console.log('previous')
            showContainer.innerHTML += `
        <div id="show_${data['show_id']}" class="col-md-3 shows ${dataResult['allCategories'][data['category']]}" data-category="${dataResult['allCategories'][data['category']]}">
                <div class="card">
                    <img src="/assets/organisations/${data['details']['banner']}" class="card-img-top img-fluid">
                    <div class="card-body">
                            <p class="ms-auto badge bg-danger categories">${dataResult['allCategories'][data['category']]}</p>
                            <h5 class="card-title">${data['show_name']}</h5>
                            <p class="card-subtitle mb-2 text-muted">${data['venue']}</p>
                            <p class="card-text">${launchDate.getDate()}/${launchDate.getMonth()}/${launchDate.getFullYear()} - ${endDate.getDate()}/${endDate.getMonth()}/${endDate.getFullYear()}</p>
                    </div>
                </div>
            </div>
        `
        } else if (launchDate > new Date()) {
            console.log('upcoming')
            showContainer.innerHTML += `
            <div id="show_${data['show_id']}" class="col-md-3 shows ${dataResult['allCategories'][data['category']]}" data-category="${dataResult['allCategories'][data['category']]}">
            <div class="card">
                <img src="/assets/organisations/${data['details']['banner']}" class="card-img-top img-fluid">
                <div class="card-body">
                        <p class="ms-auto badge bg-danger categories">${dataResult['allCategories'][data['category']]}</p>
                        <h5 class="card-title">${data['show_name']}</h5>
                        <p class="card-subtitle mb-2 text-muted">${data['venue']}</p>
                        <p class="card-text">${launchDate.getDate()}/${launchDate.getMonth()}/${launchDate.getFullYear()} - ${endDate.getDate()}/${endDate.getMonth()}/${endDate.getFullYear()}</p>
                </div>
            </div>
        </div>
    `
        } else if (launchDate < new Date() && new Date() < endDate) {
            console.log('current')
            showContainer.innerHTML += `
            <div id="show_${data['show_id']}" class="col-md-3 shows ${dataResult['allCategories'][data['category']]}" data-category="${dataResult['allCategories'][data['category']]}">
                <div class="card">
                    <img src="/assets/organisations/${data['details']['banner']}" class="card-img-top img-fluid">
                    <div class="card-body">
                            <p class="ms-auto badge bg-danger categories">${dataResult['allCategories'][data['category']]}</p>
                            <h5 class="card-title">${data['show_name']}</h5>
                            <p class="card-subtitle mb-2 text-muted">${data['venue']}</p>
                            <p class="card-text">${launchDate.getDate()}/${launchDate.getMonth()}/${launchDate.getFullYear()} - ${endDate.getDate()}/${endDate.getMonth()}/${endDate.getFullYear()}</p>
                    </div>
                </div>
            </div>
        `
        } else { console.log('error') }


    }
}

function loadingButtons (){
    for (let keys in dataResult['allCategories']){
        buttonContainer.innerHTML +=`
        <button id="filter_${dataResult['allCategories'][keys]}" type="button" data-filter="${dataResult['allCategories'][keys]}" class="btn btn-dark mx-2 btn-sm">${dataResult['allCategories'][keys]}</button>
    `
    }
    
}

showContainer.addEventListener('click', async (e)=>{
    let showTargetID ;
    if (e.target.parentElement.parentElement.matches('.shows')){
        showTargetID = e.target.parentElement.parentElement.id
        window.location.replace(`http://localhost:8080/show_details/${showTargetID}`)
        const res = await fetch(`/show_details/${e.target.parentElement.parentElement.id}`);
    }else if (e.target.parentElement.parentElement.parentElement.matches('.shows')){
        showTargetID = e.target.parentElement.parentElement.parentElement.id
        window.location.replace(`http://localhost:8080/show_details/${showTargetID}`)
    }
})


//iso init
let iso = new Isotope('.show_container', {
    itemSelector: '.shows',
    layoutMode: 'fitRows',

});

  // bind filter button click
  let filtersElem = document.querySelector('.filters-button-group');
  filtersElem.addEventListener( 'click', function( event ) {
    // only work with buttons
    if ( !matchesSelector( event.target, 'button' ) ) {
      return;
    }
    let filterValue = event.target.getAttribute('data-filter');
    console.log('filterValue: ', filterValue)
    // use matching filter function

    iso.arrange({ filter: filterValue });
  });
