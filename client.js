var socket = io.connect('http://athena.mirkwood:8000');
socket.on('news', function(data) {
    console.log(data);
    socket.emit('my other event', {
        my: 'data'
    });
});
console.log('tipota')