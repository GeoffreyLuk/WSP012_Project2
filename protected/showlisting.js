const newListContainer = document.querySelector('#list_new')
const publishedListContainer = document.querySelector('#list_published')
const unpublishedListContainer = document.querySelector('#list_unpublished')
const mainContainer = document.querySelector('#main')
const formData = {};
    formData.organiser = 'Hong Kong Philharmonic Orchestra';


window.onload = ()=>{
    loadingData()
    }
    
    
async function loadingData(){
        const res = await fetch(`/organisation/${formData.organiser}`, {
        method: "get",
        headers: {
            "Content-Type": "application/json",
        },
        });
    
        const result = await res.json();
        newListContainer.innerHTML += `
        <div class='show_link' id="new">New Show</div><br>
        `

        console.log(result)

        result.shows.forEach(element => {
            if (element.published == true){
                publishedListContainer.innerHTML += `
            <div class='show_link' id="${element.id}" href="/organisation/${formData.organiser}/show_${element.id}">${element.show_name}</div><br>
            `
            }else if (element.published == false){
                unpublishedListContainer.innerHTML += `
                <div class='show_link' id="${element.id}" href="/organisation/${formData.organiser}/show_${element.id}">${element.show_name}</div><br>
            `
            }else{console.log('error with code')}
            
        })
    }

    mainContainer.addEventListener('click',async (e)=>{
        console.log(e.target.id)
        console.log(formData.organiser)
        if (e.target.id != "new" ){
            const res = await fetch(`/organisation/${formData.organiser}/show_${e.target.id}`, {
                method: "get",
                headers: {
                    "Content-Type": "application/json",
                }
            })
            //currently retrieving data from backend, but if it is new, can skip and jump straight into it
            console.log(res)
        }else{
            const res = await fetch(`/organisation/${formData.organiser}/new`, {
                method: "get",
                headers: {
                    "Content-Type": "application/json",
                }
            })
            //paste data into form
            console.log(res)
        }
    })

    //wrap everything in one function
    //make function recursive to go back if back button is pressed