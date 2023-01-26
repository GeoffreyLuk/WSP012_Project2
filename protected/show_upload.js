let show = document.URL.split('/').pop()

window.onload = ()=>{
  let data = loadingData()
  if (show == 'show_new'){
  //use post
}else{
  //use put
}
}

async function loadingData(){
    const res = await fetch(`/get/${show}`);
  
      const result = await res.json();
      console.log(result)
      return result
}

    // <div>
    //   <input type="radio" id="huey" name="category" value="huey"
    //          checked>
    //   <label for="huey">Huey</label>
    // </div>
