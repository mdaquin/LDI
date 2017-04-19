

function newquery(){
    var keywords = $("#querytext").val();
    updateURL(keywords);
    makeQuery(keywords, {});    
}

function updateURL(kw){
    history.pushState({}, null, '/?q='+escape(kw));
}

function makeQuery(kw, filters){
    // send both queries (or more...)
}

