const socket = io.connect();

socket.on('greeting', (data) => {
    alert(data)
})