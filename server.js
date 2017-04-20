var express = require('express')
, logger = require('morgan')
, app = express()
, jade = require('jade')
, template = jade.compileFile(__dirname + '/source/templates/ldi.jade')
, rtemplate = jade.compileFile(__dirname + '/source/templates/result.jade')
, tools = require('./app')
, bodyParser = require('body-parser')

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
	tools.query(req.body.q, {}, function (chunk){
	    var data = JSON.parse(chunk);
	    var sendback = [];
	    for (var x in data['results']['bindings']){
		var rdata = tools.getDataForResult(data['results']['bindings'][x]['x']['value']);
		var html = rtemplate(rdata);
		sendback.push(html);
	    }
	    res.send(sendback);
	});
    } catch (e) {
	next(e)
    }
})

app.listen(process.env.PORT || 3000, function () {
    console.log('Listening on http://localhost:' + (process.env.PORT || 3000))
})

