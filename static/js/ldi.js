

// TODO find a way to run the query on load...

function newQuery(){
    var keywords = $("#querytext").val();
    updateURL(keywords);
    makeQuery(keywords, {});    
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
    });
}

function displayResults(data){
    var st = '<div id="results">';
    console.log(data);
    for (var x in data){
	st+='<div class="result">';
	st+=data[x];
	st+='</div>';
    }
    st += '</div>';
    $('#rightpanel').html(st);
}
