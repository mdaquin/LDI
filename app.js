var http = require('request')
, conf = require('./conf.js')
, fs = require('fs')
, md5 = require('md5')

module.exports = {
    query: function(query, filters, callback){
	var kws = query.split(' ');	
	var query = 'select distinct ?x \n where {graph <'
	    + conf.graph
	    + '> { \n'
	    + '   ?x a <'
	    + conf.tclass
	    + '>. \n    ?x ?p ?o. \n';
	for (var kw in kws){
	    query += '   filter regex(str(?o), "'+kws[kw]+'", "i") . \n';
	}
	for (var f in filters){
	    var fa = filters[f].prop.split('|');
	    if (fa.length==1){
		query += '   ?x <'+fa[0]+'> ?fv'+f+' . \n'
		    + '   filter (str(?fv'+f+') = "'+filters[f].val+'") . \n';
	    } else if (fa.length==2){
		query += '   ?x <'+fa[0]+'> [  '
		    + '<'+fa[1]+'> ?fv'+f+' ] . \n'
		    + '   filter (str(?fv'+f+') = "'+filters[f].val+'") . \n';
	    } else {
		console.log("Warning: No support for filters over more than 2 properties.");
	    }
	}
	query += '}} limit 100';
	var url = conf.endpoint+"?output=json&query="+escape(query).replace(/\+/g, '%2B');
	this.makeRequest(url, callback);
    },
    getProperties: function(query, filters, callback){
	var kws = query.split(' ');	
	var query = 'select distinct ?p ?o (count(distinct ?x) as ?n) \n where {graph <'
	    + conf.graph
	    + '> { { \n'
	    + '    ?x a <'
	    + conf.tclass
	    + '>. \n     ?x ?p ?o. ?x ?p2 ?o2 . \n'
	    + '    filter (?p not in (';
	var count=0;
	for (var bw in conf.propblacklist){
	    query+='<'+conf.propblacklist[bw]+'>';
	    count++;
	    if (count!= conf.propblacklist.length) query+=', \n      ';
	}
	query += ')) . \n';
	for (var kw in kws){
	    query += '    filter regex(str(?o2), "'+kws[kw]+'", "i") . \n';
	}
	for (var f in filters){
	    var fa = filters[f].prop.split('|');
	    if (fa.length==1){
		query += '    ?x <'+fa[0]+'> ?fv'+f+' . \n'
		    + '    filter (str(?fv'+f+') = "'+filters[f].val+'") . \n';
	    } else if (fa.length==2){
		query += '    ?x <'+fa[0]+'> [  '
		    + '<'+fa[1]+'> ?fv'+f+' ] . \n '
		    + '    filter (str(?fv'+f+') = "'+filters[f].val+'") . \n';
	    } else {
		console.log("Warning: No support for filters over more than 2 properties.");
	    }
	}
	    query += '  } UNION { \n'
	    + '    ?x a <'
	    + conf.tclass
	    + '>. \n'
	    + '    ?x ?q ?y . ?x ?p2 ?o2 . \n'
	    + '    filter (?q not in (';
	count=0;
	for (var bw in conf.propblacklist){
	    query+='<'+conf.propblacklist[bw]+'>';
	    count++;
	    if (count!= conf.propblacklist.length) query+=', \n      ';
	}
	query += ')) . \n'
	    + '    ?y ?t ?o . \n'
	    + '    filter (?t not in (';
	count=0;
	for (var bw in conf.propblacklist){
	    query+='<'+conf.propblacklist[bw]+'>';
	    count++;
	    if (count!= conf.propblacklist.length) query+=', \n      ';
	}
	query += ')) . \n'
            + '    bind(concat(concat(str(?q), "|"), str(?t)) as ?p) . \n';
	for (var kw in kws){
	    query += '    filter regex(str(?o2), "'+kws[kw]+'", "i") . \n';
	}
		for (var f in filters){
	    var fa = filters[f].prop.split('|');
	    if (fa.length==1){
		query += '    ?x <'+fa[0]+'> ?fv'+f+' . \n'
		    + '    filter (str(?fv'+f+') = "'+filters[f].val+'") . \n';
	    } else if (fa.length==2){
		query += '    ?x <'+fa[0]+'> [  '
		    + '<'+fa[1]+'> ?fv'+f+' ] . \n'
		    + '    filter (str(?fv'+f+') = "'+filters[f].val+'") . \n';
	    } else {
		console.log("Warning: No support for filters over more than 2 properties.");
	    }
	}
	query += '}}} group by ?p ?o order by desc(?n)';
	var url = conf.endpoint+"?output=json&query="+escape(query).replace(/\+/g, '%2B');
	this.makeRequest(url, callback);
    },
    makeRequest: function(url, callback){
	if (fs.existsSync('cache/'+md5(url))){
	    fs.readFile('cache/'+md5(url), 'utf8', function (err,data) {
		if (err) { 
		    console.log(err);
		    callback();		   
		}
		else callback(data);
	    });
	}
	else {
	    http(url, function(error, res, body) {
		console.log('error:', error);
		console.log('statusCode:', res && res.statusCode);
		if (!res || res.statusCode != 200){
		    console.log("Error::"+body);
		    callback();
		}
		else {
		    fs.writeFile("cache/"+md5(url), body, function(err) {
			if(err) return console.log(err);
		    }); 
		    callback(body);
		}
	    });
	}
    },
    
    getDataForResult: function(r, callback){
	var that = this;
	if (fs.existsSync('cache/'+md5(r))){
	    fs.readFile('cache/'+md5(r), 'utf8', function (err,data) {
		if (err) return console.log(err);
		that.URIDataCallback(r, data, callback)
	    });
	}
	else {
	    console.log("Querying "+r);
	    var options = {
		url: r,
		headers: {
		    'Accept': 'application/rdf+json'
		}
	    };
	    http(options, function(error, res, body) {
		console.log('error:', error);
		console.log('statusCode:', res && res.statusCode);
		if (!res || res.statusCode != 200){
		    console.log(body);
		}
		else {
		    fs.writeFile("cache/"+md5(r), body, function(err) {
			if(err) return console.log(err);
		    }); 
		    that.URIDataCallback(r, body, callback);
		}
	    });	    
	}
    },
    URIDataCallback: function (r, body, callback){
	callback(r, JSON.parse(body));
    },
    renderData: function(r, rdata){
	var res = {
	    resource: r,
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
    },
    getFilters: function(body){
	var index = 0;
	var results = [];
	var done=false;
	while(!done){
	    if (body['f['+index+'][prop]']){
		results.push({
		    prop: body['f['+index+'][prop]'],
		    val: body['f['+index+'][val]']
		});
	    } else {
		done = true;
	    }
	    index++;
	}
	return results;
    }
}
