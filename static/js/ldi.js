// TODO find a way to run the query on load...

function newQuery(){
    var keywords = $("#querytext").val();
    var filters = [];
    updateURL(keywords);
    $("input:checked").each(function(index){
	filters.push({prop: $(this).attr("prop"), val: $(this).attr("val")});
    });
    console.log(filters);
    makeQuery(keywords, filters);    
}

function updateURL(kw){
    history.pushState({}, null, '/?q='+escape(kw));
}

function makeQuery(kw, filters){
    var url='/query';
    $.ajax({
	url: url,
	type: "POST",
	data: {q: kw, f: filters}
    }).done(function(data) {
	displayResults(data);
	displayProperties(data);
    });
}

function displayResults(data){
    var st = '<div id="results">';
    console.log(data);
    for (var x in data.results){
	st+='<div class="result">';
	st+=data.results[x];
	st+='</div>';
    }
    st += '</div>';
    $('#rightpanel').html(st);
}

function filterIncluded(p,v,f){
    for (var i in f){
	if (f[i].prop == p && f[i].val == v) return true;
    }
    return false;
}

function displayProperties(data){
    var st = "";    
    for(var prop in data.props){
	st+='<div class="property">'
	    + '<div class="proplabel">'
	    + fragment(prop)+": "
	    + '</div>';
	for (var v in data.props[prop]){
	    st += '<div class="propvalue">'
		+'<input prop="'+prop+'" val="'+data.props[prop][v].value+'" type="checkbox" ';
	    if (filterIncluded(prop, data.props[prop][v].value, data.filters)){
		st += "checked";
	    }
	    st+='>'
		+ fragment(data.props[prop][v].value)
		+ ' ('
		+ data.props[prop][v].count
		+ ')</input></div>';
	}
	st+= '</div>';	
    }
    $('#propdisplay').html(st);
}

function fragment(uri){
    if (uri.indexOf('|')!=-1){
	var uria = uri.split('|');
	var result = '';
	count=0;
	for (var x in uria){
	    result+=fragment(uria[x]);
	    count++;
	    if (count!=uria.length) result+='.';
	}
	return result;
    }
    if (uri.indexOf('#')!= -1){
	return uri.substring(uri.lastIndexOf('#')+1).replace('_', ' ');
    }
    return uri.substring(uri.lastIndexOf('/')+1).replace('_', ' ');
}
