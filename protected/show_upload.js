window.onload = ()=>{
loadingData()
}

let showSubmit = document.querySelector('#uploading_show')

async function loadingData(){
    const formData = {};
    formData.organiser = 'Hong Kong Philharmonic Orchestra'

    const res = await fetch(`/organisation/${formData.organiser}`, {
        method: "get",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      const result = await res.json();
      console.log(result.text)
}


showSubmit.addEventListener('submit', async (e)=>{
    e.preventDefault()
    const form = e.target;
    const formData = new FormData(form);
    console.log(formData)

    const res = await fetch('/show_upload',{
        method:'post',
        body: formData
    })
})