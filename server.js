var express = require('express')
, logger = require('morgan')
, app = express()
, template = require('jade').compileFile(__dirname + '/source/templates/ldi.jade')
, tools = require('./app')
, conf = require('./conf')

app.use(logger('dev'))
app.use(express.static(__dirname + '/static'))

app.get('/', function (req, res, next) {
    try {
	var tparams = {title: 'Enter your query below', conf: conf, query: ""};
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

app.listen(process.env.PORT || 3000, function () {
    console.log('Listening on http://localhost:' + (process.env.PORT || 3000))
})

