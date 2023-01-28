const show = document.URL.split('_').pop();

console.log('paired')

async function main(){
    const res = await fetch(`/get_details/${show}`)
    dataResult = await res.json();
    console.log(dataResult)


    switchImage()
} 

main()

async function switchImage() {
    const res = await fetch(
      `/assets/organisations/${dataResult['details']['banner']}`
    );
    const result = await res.blob();
    const objectURL = URL.createObjectURL(result);
    docImagePreview.src = objectURL;
  }