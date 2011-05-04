
var currentIndex = -1;
var mcurrentIndex = -1;
var history = new Array();
var mhistory = new Array();

var listWidget = new Array();

function callREST(url, cb_fct, params){
  //  alert("calling :"+url);
  var xmlhttp = null;
if (window.XMLHttpRequest) {
  xmlhttp = new XMLHttpRequest();
  if ( typeof xmlhttp.overrideMimeType != 'undefined') { 
    xmlhttp.overrideMimeType('text/xml'); 
  }

} else if (window.ActiveXObject) {
  xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
} else {
  alert('Perhaps your browser does not support xmlhttprequests?');
}
xmlhttp.onreadystatechange = function() {
  if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
       cb_fct(xmlhttp.responseText, params);
  } else { }
};
xmlhttp.open('GET', url, true);
xmlhttp.setRequestHeader("Accept", "application/json");
xmlhttp.send(null);
}


   var widgetlist = new Array();


function getLabel(uri){
  splitted = uri.split("#");
  if (splitted.length>=2) return splitted[splitted.length-1];
  splitted = uri.split("/");
  return splitted[splitted.length-1];
}


   function changeClass(nc){
      theClass = nc;
      currentIndex++;
       history[currentIndex] = nc;
       element = document.getElementById("LDITitle");
       element.innerHTML = "<h1>"+getLabel(theClass)+'  <a '+
      'href="javascript:refreshWidgets();"><img '+   'src="images/refresh.png"'+
      ' height=20 /></a>'+
       '  <a '+
      'href="javascript:LDIBack();"><img '+ 'src="images/back.png"'+
      ' height=18 /></a>'+
      "</h1>\n"+ '<span ID="mainClassURI">'+nc+'</span>'+"\n";
       refreshWidgets();
   }

   function showMember(nm){
         mcurrentIndex++;
        mhistory[mcurrentIndex] = nm;
        theMember = nm;
        showWidget("member");   
   }

   function LDIBack(){
    if (currentIndex!=0){
       currentIndex=currentIndex-2;
      changeClass(history[currentIndex+1]);
    }
   }

   function LDIMBack(){
    if (mcurrentIndex!=0){
       mcurrentIndex=mcurrentIndex-2;
      showMember(mhistory[mcurrentIndex+1]);
    }
   }



   function refreshWidgets(){
     for (var wid in widgetlist){
        if (widgetlist[wid] == 1) showWidget(wid);
      }
   }


  function showPropChartMembers (inum){
      element = document.getElementById("propmc_"+inum);
      if (element.style.visibility == "hidden"){
          element.style.visibility = "visible";
           element.style.height = "auto";
      } else {
          element.style.visibility = "hidden";
           element.style.height = "0px";
      }
  }

    function showWidget(name){
      //  alert("show "+name);
      element = document.getElementById(name+'_content');
      element.innerHTML = '<span class="loadingmessage">Loading...</a>';
      callREST("widgets/"+name+'.php?class='+escape(theClass)+'&endpoint='+escape(endpoint)+'&member='+theMember, function (text, params){
	  params.innerHTML = text;
	}, element);
      widgetlist[name] = 1;
      element2 = document.getElementById(name+'_button');
      element2.innerHTML= '<a '+
      'href="javascript:hideWidget(\''+name+'\');"><img height=14 '+      'src="images/up.png" '+
      '/></a>';
    }


    function hideWidget(name){
      //  alert("show "+name);
      element = document.getElementById(name+'_content');
      element.innerHTML = "";
      widgetlist[name] = 0;
      element2 = document.getElementById(name+'_button');
      element2.innerHTML= '<a '+
      'href="javascript:showWidget(\''+name+'\');"><img height=14 '+    'src="images/down.png" '+
      '/></a>';
    }

    function addWidget(name, label, el){
      element = document.getElementById(el);
      element.innerHTML='<div class="widget"><h2>'+label+' <span ID="'+name+'_button"><a '+
      'href="javascript:hideWidget(\''+name+'\');"><img height=14 '+ 'src="images/up.png" '+
      '/></a></span></h2><div ID="'+name+'_content"></div></div>';
      showWidget(name);
      widgetlist[name] = 1;
   }
