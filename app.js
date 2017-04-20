var http = require('http')
, conf = require('./conf.js')

module.exports = {
    query: function(query, filters, callback){
	var kws = query.split(' ');	
	var query = 'select distinct ?x where {graph <'
	    + conf.graph
	    + '> {'
	    + '?x a <'
	    + conf.tclass
	    + '>. ?x ?p ?o. ';
	for (var kw in kws){
	    query += 'filter regex(str(?o), "'+kws[kw]+'", "i") .';
	}
	query += '}} limit 10';
	var url = conf.endpoint+"?output=json&query="+escape(query);
	this.makeRequest(url, callback);
    },
    getProperties(params){
	console.log("Props");
	console.log(params);
	return "no props";
    },
    makeRequest: function(url, callback){
	http.request(url, function(res) {
	    console.log('STATUS: ' + res.statusCode);
	    console.log('HEADERS: ' + JSON.stringify(res.headers));
	    res.setEncoding('utf8');
	    res.on('data', function (chunk) {
		callback(chunk);
	    });
	}).end();
    },
    getDataForResult: function(r){
	// resolve r
	// get the title, snippet, additional props
	return {title: "This is a result", description: r};
    }
}
