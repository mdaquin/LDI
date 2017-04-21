var express = require('express')
, logger = require('morgan')
, app = express()
, jade = require('jade')
, template = jade.compileFile(__dirname + '/source/templates/ldi.jade')
, rtemplate = jade.compileFile(__dirname + '/source/templates/result.jade')
, tools = require('./app')
, bodyParser = require('body-parser')
, sleep = require('sleep')

app.use(logger('dev'));
app.use(express.static(__dirname + '/static'));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.get('/', function (req, res, next) {
    try {
	var tparams = {title: 'Enter your query below', query: ""};
        if (req.query.q){
	    tparams.query=req.query.q;
	    tparams.title='Querying : '+req.query.q;
	}	
	var html = template(tparams);
	res.send(html)
    } catch (e) {
	next(e)
    }
})

app.post('/query', function (req, res, next) {
    try {	
	if (!req.body.q){
	    res.send({error: "missing query parameter q", query: req.body});
	    return;
	}
	var sendback = {results: [], props: {}};
	var propsback = false;
	var datacount = 10000;
	tools.query(req.body.q, {}, function (chunk){
	    console.log("back from querying");
	    var data = JSON.parse(chunk);
	    datacount = data['results']['bindings'].length;
	    console.log("data count = "+datacount);
	    for (var x in data['results']['bindings']){
		var rdata = tools.getDataForResult(
		    data['results']['bindings'][x]['x']['value'],
		    function(r, rdata){
			var tdata = tools.renderData(r, rdata);
			var html = rtemplate(tdata);
			sendback.results.push(html);
			if (sendback.results.length == datacount
			    && propsback)
			    res.send(sendback);
		    });		
	    }
	});
	tools.getProperties(req.body.q, {}, function (chunk){
	    console.log("props back");
	    var data = JSON.parse(chunk).results.bindings;
	    for (var x in data){
		if (data[x]['n'].value != '1'){
		    if (!sendback.props[data[x]['p'].value])
			sendback.props[data[x]['p'].value] = [];
		    sendback.props[data[x]['p'].value].push({value:
								data[x]['o'].value,
								count:
								data[x]['n'].value});
		}
	    }
	    propsback = true;
	    if (sendback.results.length == datacount
		&& propsback)
		res.send(sendback);
	});
    } catch (e) {
	next(e)
    }
})

app.listen(process.env.PORT || 3000, function () {
    console.log('Listening on http://localhost:' + (process.env.PORT || 3000))
})

