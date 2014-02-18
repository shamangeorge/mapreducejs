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
