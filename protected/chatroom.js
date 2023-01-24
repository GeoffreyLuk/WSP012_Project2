window.onload = async () => {
    const searchParams = new URLSearchParams(location.search);
    const userId = searchParams.get("userId");

    console.log("User ID: ", userId);
    // Use the id to fetch data from
    const res = await fetch(`/chatroom/user/${userId}`)
    if (res.ok) {
        console.log("Success");
    } else {
        console.log("Failed");
    }

}
