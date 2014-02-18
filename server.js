var url = require("url"),
    path = require("path"),
    fs = require("fs"),
    port = process.argv[2] || 8000,
    app = require('http').createServer(handler),
    io = require('socket.io').listen(app);

app.listen(parseInt(port, 10));
console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");

function handler(request, response) {

    var uri = url.parse(request.url).pathname,
        filename = path.join(process.cwd(), uri);

    path.exists(filename, function(exists) {
        if (!exists) {
            response.writeHead(404, {
                "Content-Type": "text/plain"
            });
            response.write("404 Not Found\n");
            response.end();
            return;
        }

        if (fs.statSync(filename).isDirectory()) filename += '/index.html';

        fs.readFile(filename, "binary", function(err, file) {
            if (err) {
                response.writeHead(500, {
                    "Content-Type": "text/plain"
                });
                response.write(err + "\n");
                response.end();
                return;
            }

            response.writeHead(200);
            response.write(file, "binary");
            response.end();
        });
    });
}

io.sockets.on('connection', function(socket) {
    socket.emit('news', {
        hello: 'Im Listening. Gimme text to process'
    });
    socket.on('map', function(data) {
        //console.log(data);
        var t = mapper(data.msg);
        socket.emit('map', {
            map: t.map,
            txt: t.txt
        });
    });
    socket.on('sort', function(data) {
        //console.log(data);
        var t = ssort(data.msg);
        socket.emit('sort', {
            map: t.map,
            txt: t.txt
        });
    });
    socket.on('reduce', function(data) {
        //console.log(data);
        var t = reduce(data.msg);
        socket.emit('reduce', {
            map: t.map,
            txt: t.txt
        });
    });
    socket.on('mapreduce', function(data) {
        var t = reduce(ssort(mapper(data.msg).map).map);
        //console.log(t);
        socket.emit('mapreduce', {
            map: t.map,
            txt: t.txt
        });
    })
});


function mapper(input) {
    var inputRows = input.split("\n");
    var text = "";
    var allMapOut = new Array();
    for (var j = 0; j < inputRows.length; j++) {
        if (inputRows[j].length > 0) {
            var mapOut = new Object();
            mapOut.key = new Array;
            mapOut.val = new Array;

            var words = inputRows[j].split(" ");
            for (var i = 0; i < words.length; i++) {
                words[i] = words[i].replace(/[^a-z0-9]/gi, '');
                if (words[i].length > 0) {
                    mapOut.key[mapOut.key.length] = words[i].toLowerCase();
                    mapOut.val[mapOut.val.length] = 1;
                }
            }

            text += "<b>Mapper " + j + " Output</b><br>";
            for (var i = 0; i < mapOut.key.length; i++) {
                text += "(" + mapOut.key[i] + ", " + mapOut.val[i] + ")";
                if (i < mapOut.key.length - 1) {
                    text += ", ";
                }
            }
            text += "<br>";
            allMapOut[j] = mapOut;
        }
    }
    return {
        map: allMapOut,
        txt: text
    }
}

function ssort(mapOut) {
    var ssOut = new Object();
    ssOut.key = new Array();
    ssOut.val = new Array();
    var text = "<b>Shuffle and Sort Output</b><br>";

    //suffle
    for (var k = 0; k < mapOut.length; k++) {
        for (var i = 0; i < mapOut[k].key.length; i++) {
            var loc = ssOut.key.indexOf(mapOut[k].key[i]);
            if (loc == -1) {
                loc = ssOut.key.length;
                ssOut.key[loc] = mapOut[k].key[i];

                ssOut.val[loc] = new Array();
                ssOut.val[loc][0] = mapOut[k].val[i];
            } else {
                ssOut.val[loc][ssOut.val[loc].length] = mapOut[k].val[i];
            }
        }
    }
    //sort
    for (var i = 0; i < ssOut.key.length; i++) {
        for (var j = 0; j < ssOut.key.length; j++) {
            if (ssOut.key[i] < ssOut.key[j]) { //lexicographic
                //if (ssOut.val[i] < ssOut.val[j]) {//descending
                //if (ssOut.val[i] > ssOut.val[j]) { //ascending
                var tempKey = ssOut.key[i];
                var tempVal = ssOut.val[i];
                ssOut.key[i] = ssOut.key[j];
                ssOut.val[i] = ssOut.val[j];
                ssOut.key[j] = tempKey;
                ssOut.val[j] = tempVal;
            }
        }
    }
    //print
    for (var i = 0; i < ssOut.key.length; i++) {
        text += "(" + ssOut.key[i] + ", {";
        for (var j = 0; j < ssOut.val[i].length; j++) {
            text += ssOut.val[i][j];
            if (j < ssOut.val[i].length - 1) {
                text += ", ";
            }
        }
        text += "})<br>";
        if (i < ssOut.key.length - 1) {
            text += "";
        }
    }
    return {
        map: ssOut,
        txt: text
    }
}

function reduce(ssOut) {
    var redOut = new Object();
    redOut.key = new Array();
    redOut.val = new Array();
    var text = "<b>Reducer Output</b><br>";

    for (var i = 0; i < ssOut.key.length; i++) {
        redOut.key[i] = ssOut.key[i];
        redOut.val[i] = 0;
        for (var j = 0; j < ssOut.val[i].length; j++) {
            redOut.val[i] += ssOut.val[i][j];
        }

        text += "(" + redOut.key[i] + ", " + redOut.val[i] + ")<br>";
        if (i < ssOut.key.length - 1) {
            text += "";
        }
    }
    return {
        map: redOut,
        txt: text
    }
}
