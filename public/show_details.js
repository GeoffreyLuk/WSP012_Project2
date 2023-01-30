const show = document.URL.split('_').pop();
const docImagePreview = document.querySelector('#banner_preview')
const docCategory = document.querySelector('#show_category')
const docTitle = document.querySelector('#show_title')
const docOrganiser = document.querySelector('#show_organiser')
const docContent = document.querySelector('#show_content')
const docFavourites =document.querySelector('#likedShow')
const docDate = document.querySelector('#show_date')
const docVenue = document.querySelector('#show_venue')
const docAddress = document.querySelector('#show_address')
const liked = document.querySelector

console.log('paired')

async function main(){
    const res = await fetch(`/get_details/${show}`)
    let dataResult = await res.json();
    let showDetails = dataResult['showDetails']
    console.log(dataResult)
    console.log(dataResult['showDetails'])

    switchImage(showDetails['details']['banner'])
    let launchDate = new Date(showDetails['launch_date'])
        let endDate = new Date(showDetails['end_date'])

    docCategory.innerHTML = `${dataResult['allCategories'][showDetails['category']]}`
    docTitle.innerHTML = `${[showDetails['details']['title']]}`
    docOrganiser.innerHTML = `${dataResult['organiserDetails']}`
    docContent.innerHTML = `${[showDetails['details']['content']]}`
    docDate.innerHTML = `${launchDate.getDate()}/${launchDate.getMonth()}/${launchDate.getFullYear()} - ${endDate.getDate()}/${endDate.getMonth()}/${endDate.getFullYear()}`
    docVenue.innerHTML = `${[showDetails['venue']]}`
    docAddress.innerHTML = `${[showDetails['address']]}`


} 

main()

async function switchImage(image) {
    const res = await fetch(
      `/assets/organisations/${image}`
    );
    const result = await res.blob();
    const objectURL = URL.createObjectURL(result);
    docImagePreview.src = objectURL;
  }



  docFavourites.addEventListener('click', async (e)=>{
    let res = fetch(`/show_details/${show}`,{
      method: 'POST',
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({application:'fan club'})
    })

    const result = await res.json();
    alert(result.message)
  })
