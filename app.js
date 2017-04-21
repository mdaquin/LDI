var http = require('request')
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
    getProperties: function(query, filters, callback){
	var kws = query.split(' ');	
	var query = 'select distinct ?p ?o (count(distinct ?x) as ?n) where {graph <'
	    + conf.graph
	    + '> { {'
	    + '?x a <'
	    + conf.tclass
	    + '>. ?x ?p ?o. '
	    + 'filter (?p not in (';
	var count=0;
	for (var bw in conf.propblacklist){
	    query+='<'+conf.propblacklist[bw]+'>';
	    count++;
	    if (count!= conf.propblacklist.length) query+=',';
	}
	query += ')) . ';
	for (var kw in kws){
	    query += 'filter regex(str(?o), "'+kws[kw]+'", "i") .';
	}
	    query += '} UNION { '
	    + '?x a <'
	    + conf.tclass
	    + '>. '
	    + '?x ?q ?y . '
	    + 'filter (?q not in (';
	count=0;
	for (var bw in conf.propblacklist){
	    query+='<'+conf.propblacklist[bw]+'>';
	    count++;
	    if (count!= conf.propblacklist.length) query+=',';
	}
	query += ')) . '
	    + '?y ?t ?o . '
	    + 'filter (?t not in (';
	count=0;
	for (var bw in conf.propblacklist){
	    query+='<'+conf.propblacklist[bw]+'>';
	    count++;
	    if (count!= conf.propblacklist.length) query+=',';
	}
	query += ')) . '
            + 'bind(concat(concat(str(?q), "|"), str(?t)) as ?p) .';
	for (var kw in kws){
	    query += 'filter regex(str(?y), "'+kws[kw]+'", "i") .';
	}
	query += '}}} group by ?p ?o order by desc(?n)';
	// console.log(query);
	var url = conf.endpoint+"?output=json&query="+escape(query);
	this.makeRequest(url, callback);
    },
    makeRequest: function(url, callback){
	http(url, function(error, res, body) {
	    console.log('error:', error);
	    console.log('statusCode:', res && res.statusCode);
	    if (res.statusCode != 200)
		console.log(body);
	    callback(body);
	});
    },
    getDataForResult: function(r, callback){
	console.log("Querying "+r);
	var that = this;
	var options = {
	    url: r,
	    headers: {
		'Accept': 'application/rdf+json'
	    }
	};
	http(options, function(error, res, body) {
	    console.log('error:', error);
	    console.log('statusCode:', res && res.statusCode);
	    if (res.statusCode != 200)
		console.log(body);
	    that.URIDataCallback(r, body, callback)
	});	    
    },
    URIDataCallback: function (r, body, callback){
	callback(r, JSON.parse(body));
    },
    renderData: function(r, rdata){
	var res = {
	    title:"Title not found or configured",
	    description: "Description not found or configured",
	    others: [],
	};
	if (conf.titleprops && conf.titleprops[0]){
	    if (rdata[r][conf.titleprops[0]])
		res.title = rdata[r][conf.titleprops[0]][0]['value'];
	    else
		res.title = "Title not found in data";
	}
	if (conf.snippetprops && conf.snippetprops[0]){
	    if (rdata[r][conf.snippetprops[0]])
		res.description = rdata[r][conf.snippetprops[0]][0]['value'];
	    else
		res.description = "Description text not found in data";
	}
	return res;
    }
}
