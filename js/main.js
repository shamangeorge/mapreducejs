function readFile(path) {
    var request = new XMLHttpRequest();
    request.open("GET", path, false);
    request.send(null);
    var returnValue = request.responseText;
    return returnValue;
};

function init() {
    var text = "";
    text = readFile('./nietzshe.txt');
    ui.input.innerHTML = text;
    ui.buttons.shuffle.hidden = true;
    ui.buttons.red.hidden = true;
    return text;
}
var ui = {
    buttons: {
        map: document.getElementById('map'),
        shuffle: document.getElementById('sort'),
        red: document.getElementById('reduce'),
        restart: document.getElementById('restart'),
        all: document.getElementById('runAll'),
        unknown: document.getElementById('unknown'),
        stop: document.getElementById('stop'),
        visMe: document.getElementById('gen_viz'),
        reWork: document.getElementById('reWork'),
    },
    output: {
        map: document.getElementById('mapout'),
        shuffle: document.getElementById('ssortout'),
        red: document.getElementById('reduceout'),
    },
    input: document.getElementById('input'),
    fb: {
        wait: document.getElementById('waiting'),
    }
};
var input = init();
var mapOut;
var ssOut;
var redOut;
var rFlag = false;
var worker; //bob the builder
var MAX_NODES = 1700;
ui.buttons.reWork.addEventListener('click', MapReduce, false);

function reInit(e) {
    input = init();
    d3.select("svg").remove();
    ui.output.map.innerHTML = '';
    ui.output.shuffle.innerHTML = '';
    ui.output.red.innerHTML = '';
}

function visMe(e) {
    if (rFlag && redOut.val.length < MAX_NODES) {
        visualizeMe();
    } else {
        ui.output.red.innerHTML = '<span style="color:red;">We are sorry there seems to be a problem...<br> Either You have not run the whole map reduce program yet, or your input is too big for visualization and your UI would crash. <br>You can still view the text output for large files. <br>You may wish to make your file smaller or if you wish to be adventurous you can change the variable MAX_NODES in the source and see where that takes you.</span>';
    }
}

ui.fb.wait.style.display = 'none';

function start(e) {
    worker.postMessage({
        'cmd': 'start',
        'msg': 'Hi'
    });
}

function mapper(e) {
    ui.fb.wait.style.display = 'block';
    ui.output.red.innerHTML = '';
    worker.postMessage({
        'cmd': 'map',
        'msg': input
    });
}

function ssort(e) {
    ui.fb.wait.style.display = 'block';
    worker.postMessage({
        'cmd': 'sort',
        'msg': JSON.stringify(mapOut)
    });
}

function reducer(e) {
    ui.fb.wait.style.display = 'block';
    worker.postMessage({
        'cmd': 'reduce',
        'msg': JSON.stringify(ssOut)
    });
}

function runAll(e) {
    ui.fb.wait.style.display = 'block';
    worker.postMessage({
        'cmd': 'all',
        'msg': input
    });
}

function stop(e) {
    // worker.terminate() from this script would also stop the worker.
    worker.postMessage({
        'cmd': 'stop',
        'msg': 'Bye'
    });
}

function unknownCmd(e) {
    worker.postMessage({
        'cmd': 'foobard',
        'msg': '???'
    });
}

function MapReduce(e) {
    ui.buttons.map.addEventListener('click', mapper, false);
    ui.buttons.shuffle.addEventListener('click', ssort, false);
    ui.buttons.red.addEventListener('click', reducer, false);
    ui.buttons.restart.addEventListener('click', reInit, false);
    ui.buttons.all.addEventListener('click', runAll, false);
    ui.buttons.unknown.addEventListener('click', unknownCmd, false);
    ui.buttons.stop.addEventListener('click', stop, false);
    ui.buttons.visMe.addEventListener('click', visMe, false);
    worker = new Worker('./js/mapreduce_worker.js');

    worker.addEventListener('message', function(e) {
        var data = JSON.parse(e.data);
        ui.fb.wait.style.display = 'none';
        if (data.type === 'string') {
            ui.output.map.innerHTML = data.str;
        } else if (data.type === 'map') {
            ui.output.map.innerHTML = JSON.parse(data.str).txt;
            ui.buttons.shuffle.hidden = false;
            mapOut = JSON.parse(data.str).map;
            rFlag = false;
        } else if (data.type === 'sort') {
            ui.output.shuffle.innerHTML = JSON.parse(data.str).txt;
            ui.buttons.red.hidden = false;
            ssOut = JSON.parse(data.str).map;
            rFlag = false;
        } else if (data.type === 'reduce') {
            ui.output.red.innerHTML = JSON.parse(data.str).txt;
            redOut = JSON.parse(data.str).map;
            rFlag = true;
        } else if (data.type === 'all') {
            ui.output.red.innerHTML = JSON.parse(data.str).txt;
            redOut = JSON.parse(data.str).map;
            if (redOut.val.length < MAX_NODES) {
                visualizeMe();
            }
        } else if (data.type === 'stop') {
            ui.output.red.innerHTML = data.str;
            ui.buttons.map.removeEventListener('click', mapper, false);
            ui.buttons.shuffle.removeEventListener('click', ssort, false);
            ui.buttons.red.removeEventListener('click', reducer, false);
            ui.buttons.restart.removeEventListener('click', reInit, false);
            ui.buttons.all.removeEventListener('click', runAll, false);
            ui.buttons.unknown.removeEventListener('click', unknownCmd, false);
            ui.buttons.stop.removeEventListener('click', stop, false);
            ui.buttons.visMe.removeEventListener('click', visMe, false);
            input = init();
            d3.select("svg").remove();
            ui.output.map.innerHTML = '';
            ui.output.shuffle.innerHTML = '';
            delete worker;
        }
    }, false);
}

function visualizeMe() {
    d3.select("svg").remove();
    var MAX = Math.max.apply(Math, redOut.val);
    var width = window.innerWidth,
        height = window.innerHeight;
    var tTime = 2500;
    var svg = d3.select("#graph").append("svg")
        .attr("width", width)
        .attr("height", height)

    var fill = d3.scale.category10();

    var graph = {
        nodes: [],
        links: []
    };

    var nb_nodes = redOut.val.length,
        nb_cat = 10;

    graph.nodes = d3.range(nb_nodes).map(function(i) {
        return {
            cat: Math.floor(nb_cat * Math.random()),
            str: redOut.key[i],
            freq: redOut.val[i],

        };
    })

    graph.nodes.map(function(d, i) {

        graph.nodes.map(function(e, j) {
            if (Math.random() > .99 && i != j)
                graph.links.push({
                    "source": i,
                    "target": j
                })

        })
    })

    function newMap(x, min, max, a, b) {
        return (b - a) * (x - min) / (max - min) + a;
    }

    function tick(d) {

        graph_update(0);
    }

    function default_layout() {

        graph.nodes.forEach(function(d, i) {
            d.x = newMap(i, 0, redOut.val.length, 0, width);
            d.y = height - newMap(d.freq, 0, MAX, 0, height);
        })
        graph_update(tTime);
    }

    function line_layout() {

        graph.nodes.forEach(function(d, i) {
            d.x = newMap(d.freq, 0, MAX, 0, width);
            d.y = newMap(i, 0, redOut.val.length, 0, height);
        })

        graph_update(tTime);
    }

    function line_cat_layout() {

        graph.nodes.forEach(function(d, i) {
            d.x = newMap(i, 0, redOut.val.length, 0, width);
            d.y = height / 2 + newMap(d.freq, 0, MAX, 0, height / 2);
        })

        graph_update(tTime);
    }

    function radial_layout() {

        var r = height / 2;

        var arc = d3.svg.arc()
            .outerRadius(r);

        var pie = d3.layout.pie()
            .sort(function(a, b) {
                return a.cat - b.cat;
            })
            .value(function(d, i) {
                return 1;
            }); // equal share for each point

        graph.nodes = pie(graph.nodes).map(function(d, i) {
            d.innerRadius = 0;
            d.outerRadius = r;
            d.data.x = arc.centroid(d)[0] + width / 2;
            d.data.y = arc.centroid(d)[1] + height / 2;
            d.data.endAngle = d.endAngle;
            d.data.startAngle = d.startAngle;
            return d.data;
        })

        graph_update(tTime);
    }

    function category_color() {
        d3.selectAll("circle").transition().duration(tTime).style("fill", function(d) {
            return fill(newMap(d.freq, 0, MAX, 0, 255));
        });
    }

    function category_size() {
        d3.selectAll("circle").transition().duration(tTime).attr("r", function(d) {
            return newMap(d.freq, 0, MAX, 0, height / 2);
        });
    }

    function graph_update(delay) {

        link.transition().duration(delay)
            .attr("x1", function(d) {
                return d.target.x;
            })
            .attr("y1", function(d) {
                return d.target.y;
            })
            .attr("x2", function(d) {
                return d.source.x;
            })
            .attr("y2", function(d) {
                return d.source.y;
            });

        node.transition().duration(delay)
            .attr("transform", function(d) {
                return "translate(" + d.x + "," + d.y + ")";
            });
    }

    d3.select("input[value=\"default\"]").on("click", default_layout);
    d3.select("input[value=\"line\"]").on("click", line_layout);
    d3.select("input[value=\"line_cat\"]").on("click", line_cat_layout);
    d3.select("input[value=\"radial\"]").on("click", radial_layout);

    d3.select("input[value=\"nocolor\"]").on("click", function() {
        d3.selectAll("circle").transition().duration(tTime).style("fill", "#66CC66");
    })

    d3.select("input[value=\"color_cat\"]").on("click", category_color);

    d3.select("input[value=\"nosize\"]").on("click", function() {
        d3.selectAll("circle").transition().duration(tTime).attr("r", 5);
    })

    d3.select("input[value=\"size_cat\"]").on("click", category_size);

    var link = svg.selectAll(".link")
        .data(graph.links)
        .enter().append("line")
        .attr("class", "link")

    var node = svg.selectAll(".node")
        .data(graph.nodes)
        .enter()
        .append("g").attr("class", "node");

    node.append("circle")
        .attr("r", function(i) {
            return 5;
        })
    node.append("svg:title")
        .text(function(i) {
            return i.str;
        })

    default_layout();

};
MapReduce();
