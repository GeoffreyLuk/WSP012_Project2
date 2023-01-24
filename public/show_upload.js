let showSubmit = document.querySelector('#uploading_show')

showSubmit.addEventListener('submit', async (e)=>{
    e.preventDefault()
    const form = e.target;
    const formData = new FormData(form);
    console.log(formData)

    const res = await fetch('/show_upload',{
        method:'post',
        body: formData,
    })
})