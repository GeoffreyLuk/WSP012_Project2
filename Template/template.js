console.log('navbar connected')

const loginMenu = document.querySelectorAll('.login_menu')
const mainMenu = document.querySelector('#menu_menu')
const profilePic = document.querySelectorAll('.profile_pic')
console.log(loginMenu)

async function main() {
    console.log('loading nav')
    await isLoggedin()
}
main()

async function isLoggedin(){
    const res = await fetch(`/checkLoggedIn`);
    let userProfile = await res.json();

    if (userProfile.logged == false){
        loadNavBar(false)
    }else{
        loadNavBar(true,userProfile.privilege,userProfile.name,userProfile.icon)
    }
    
    function loadNavBar(boolean,orgPrivilege=2 ,name = null,icon='default_icon.png'){
        if (!boolean){
            loginMenu.forEach(element => {
                element.innerHTML += `
                <li><a class="dropdown-item text-main" href="/login">Login</a></li>
                <li>
                    <hr class="dropdown-divider text-main">
                </li>
                <li><a class="dropdown-item text-main" href="/signup">Sign Up</a></li>
            `
            });
        }else{
            if (orgPrivilege < 2){
                mainMenu.innerHTML+=`
                <li class="nav-item">
                        <a class="nav-link" href="#">Organisation [not linked]</a>
                    </li>
                `
            }
            loginMenu.forEach(element => {
            element.innerHTML += `
                <li><div class="dropdown-item text-main" >Welcome back, ${name}!</div></li>
                <li><hr class="dropdown-divider text-main"></li>
                <li><a class="dropdown-item text-main" href="">Shopping Cart [not linked]</a></li>
                <li><hr class="dropdown-divider text-main"></li>
                <li><a class="dropdown-item text-main" href="/signup">Edit Profile</a></li>
                <li><a class="dropdown-item text-main" href="/signup">Reset Password</a></li>
                <li><a class="dropdown-item text-main" href="">Purchase Record [not linked]</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item text-main" href="/logout">Logout</a></li>

            `
        })
        profilePic.forEach(element=>{
            element.src = `assets/users_icon/${icon}`
        })
    }
}
}
