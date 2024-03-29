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

async function isLoggedin() {
    const res = await fetch(`/checkLoggedIn`);
    let userProfile = await res.json();

    if (userProfile.logged == false) {
        loadNavBar(false)
    } else {
        loadNavBar(true, userProfile.privilege, userProfile.name, userProfile.icon)
    }

    function loadNavBar(boolean, orgPrivilege = 2, name = null, icon = 'default_icon.png') {
        if (!boolean) {
            loginMenu.forEach(element => {
                element.innerHTML += `
                <li><a class="dropdown-item text-main" href="/login">Login</a></li>
                <li>
                    <hr class="dropdown-divider text-main">
                </li>
                <li><a class="dropdown-item text-main" href="/signup">Sign Up</a></li>
            `
            });
        } else {
            if (orgPrivilege < 2) {
                mainMenu.innerHTML += `
                <li class="nav-item">
                <a class="nav-link" href="/chatroom">Chatroom</a>
                </li>
                <li class="nav-item">
                        <a class="nav-link" href="/showlisting">Organisation</a>
                    </li>
                `
            } else {
                mainMenu.innerHTML += `
                <li class="nav-item">
                <a class="nav-link" href="/chatroom">Chatroom</a>
                </li>
            `
            }
            loginMenu.forEach(element => {
                element.innerHTML += `
                <li><div class="dropdown-item text-main" >Welcome back, ${name}!</div></li>
                <li><hr class="dropdown-divider text-main"></li>
                <li><a class="dropdown-item text-main" href="/checkout">Shopping Cart</a></li>
                <li><hr class="dropdown-divider text-main"></li>
                <li><a class="dropdown-item text-main" href="/editProfile">Edit Profile</a></li>
                <li><a class="dropdown-item text-main" href="/resetPW">Reset Password</a></li>
                <li><a class="dropdown-item text-main" href="/purchase_record">Purchase Record</a></li>
                <li><hr class="dropdown-divider"></li>
                <li><a class="dropdown-item text-main" href="/logout">Logout</a></li>

            `
            })
            profilePic.forEach(element => {
                element.src = `/assets/users_icon/${icon}`
            })
        }
    }
}
