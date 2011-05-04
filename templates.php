<?php

  include_once("utils.php");
  include_once("conf/conf.php");



  function LDIHeader($theClass){
    return "<head><title>LDI - ".getLabel($theClass).'</title><link rel="stylesheet" type="text/css" href="css/style.css" media="screen" />  <script type="text/javascript" src="LDIWidgets.js"></script> </head><body><div ID="main">'."\n";
  }

  function buildSubclassGraphQuery($subclasses){
    $toReturn = 'select ?cat ?x where {?x a ?cat. FILTER( ';
    $index = 0;
    foreach($subclasses as $sc){
      $toReturn = $toReturn.'?cat = <'.$sc.'> ';
      if ($index!==count($subclasses)-1){
	$toReturn = $toReturn.'|| ';
      }
      $index = $index+1;
    }
    $toReturn = $toReturn.' )} ORDER BY ?x LIMIT 3000';
    return $toReturn;
  }



  function LDISubClassSummary($theClass, $endpoint){
    $subclasses = getDirectSubclasses($theClass, $endpoint);
    if (count($subclasses)!==0){
       $nb = getInstanceNumber($theClass, $endpoint);
      if ($nb >= 1000){
	$toReturn =  $toReturn."<h3>".getLabel($theClass)." (more than 1,000 members)</h3>";
      }
      else {
      	$toReturn =  $toReturn."<h3>".getLabel($theClass)." (".$nb." members)</h3>";
      }
      $toReturn =  $toReturn."   <table><tr><td><ul>\n";
      foreach ($subclasses as $sc){
	$toReturn =  $toReturn.'    <li><a href="javascript:changeClass(\''.$sc.'\');">'.getLabel($sc)."</a></li>\n";
      }
      $toReturn =  $toReturn."   </ul></td><td>\n";
      $graphquery = buildSubClassGraphQuery($subclasses);
      // echo htmlEntities($graphquery).'<br/>';
      $toReturn =  $toReturn.'<img src="http://data.open.ac.uk/applications/ldchart.php?legend=0&cht=p&chs=400x150&chco='.$GLOBALS['piechartcolor'].'&endpoint='.$endpoint.'&query='.urlencode($graphquery).'" />'."\n";
      $toReturn =  $toReturn."   </td></tr></table>\n";      
    }
    else {
      $nb = getInstanceNumber($theClass, $endpoint);
      if ($nb >= 1000){
	$toReturn = '<span class="message">No sub-class - more than 1,000 members</span>';
      } else {
	$toReturn = '<span class="message">No sub-class - '.$nb.' members</span>';
      }
    }
    return $toReturn;
  }

function LDIPropertiesSummary($theClass, $endpoint){
  $props = getAppliedProperties($theClass, $endpoint);
  // print_r($props[1]);
  if (count($props[0])!==0){
    // echo count($props[0]);
    foreach ($props[0] as $prop => $vals){
      $toReturn = $toReturn.'    <h3>'.getLabel($prop);
      $nb = $vals['number'];
      if ($nb==1){
	foreach($vals as $v => $n){
	  if (strcmp($v, "number")!== 0) {
	    $toReturn =  $toReturn." = ".getLabel($v);
	  }
	}
      }
      else {
	
	$toReturn =  $toReturn.' [<a href="javascript:showPropChartMembers(\''.md5($prop).'\');">'.$nb." values</a>]";
     if (isset($props[1][$prop])){
      $nbc = $props[1][$prop]['number'];
      if ($nbc===1 && $nb !== 1){
	foreach($props[1][$prop] as $cl => $number){
	  if (strcmp($cl, "number")!== 0) {
	    $toReturn =  $toReturn.' all <a href="javascript:changeClass(\''.$cl.'\');">'.getLabel($cl).'</a>';
	  } 
	}
      }
      else {
	$toReturn =  $toReturn." [".$nbc." classes]";
      }
      }
      }
 
      $toReturn =  $toReturn."</h3>\n";
      $toReturn =  $toReturn.'<div ID="propmc_'.md5($prop).'" class="propertyview" style="visibility: hidden; height: 0px;">'."\n<table><tr><td><ul>";
	foreach($props[0][$prop] as $v => $number){
	  if (strcmp($v, "number")!== 0) {
	    $toReturn =  $toReturn.'<li><a href="javascript:showMember(\''.$v.'\');">'.getLabel($v)." (".$number.")</li>\n";
	  }
	}	
	$toReturn =  $toReturn.'</ul></td><td>';
	$toReturn =  $toReturn.'<img src="http://data.open.ac.uk/applications/ldchart2.php?legend=1&chs=600x300&chco='.$GLOBALS['chartcolor'].'&endpoint='.$endpoint.'&query=select%20%3Fcat%20where%20{%3Fx%20a%20<'.urlencode($theClass).'>.%20%3Fx%20<'.urlencode($prop).'>%20%3Fcat%20}%20ORDER BY %20%3Fcat%20LIMIT%203000%0A" />';	
	$toReturn =  $toReturn.'</td></tr></table>';	
	$toReturn =  $toReturn.'</div>';
     
// 	$toReturn =  $toReturn.'<div class="propertyview">'."\n<table><tr><td><ul>";
// 	foreach($props[1][$prop] as $v => $number){
// 	  if (strcmp($v, "number")!== 0) {
// 	    $toReturn =  $toReturn.'<li><a href="javascript:changeClass(\''.$v.'\');">'.getLabel($v)."</a> (".$number.")</li>\n";
// 	  }
// 	}
// 	$toReturn =  $toReturn.'</ul></td><td>';
// 	$toReturn =  $toReturn.$nbc;
// 	$toReturn =  $toReturn.'<img src="http://data.open.ac.uk/applications/ldchart.php?legend=1&cht=bvo&yinc=20&chs=600x300&chco=FF0000|00FFFF|0000FF|FFFF00|00FF00|FF00FF&endpoint='.$endpoint.'&query=select%20%3Fcat%20where%20%7B%3Fx%20a%20%3C'.urlencode($theClass).'%3E.%20%3Fx%20%3C'.urlencode($prop).'%3E%20%3Fy.%20%3Fy%20a%20%3Fcat%20.FILTER%20(%3Fcat%20!%3D%20%3Chttp%3A%2F%2Fwww.w3.org%2F2000%2F01%2Frdf-schema%23Resource%3E)%0A%0A%7D%20ORDER%20BY%20%20%3Fcat%20LIMIT%203000%0A%0A" />';	
// 	$toReturn =  $toReturn."</td></tr></table>\n";	
// 	$toReturn =  $toReturn."</div>\n";
      
    }
  }
  return $toReturn;
}
  
  function LDITypicalObject($theClass, $endpoint){
    $toReturn = '<h2>Typical Member</h2><div ID="typicalmember">'."\n";
    $toReturn =  $toReturn."</div>\n";
    return $toReturn;
  }

  function LDIMembers($theClass, $endpoint){ // add ranking function
     $members = getMemberList($theClass, $endpoint);
    if (count($members)===0){
      return '<span class="message">No member of this class.</span>';
    }
    $toReturn =  $toReturn."<ul>\n";
    $muri = "";
    $td = "";
    $ta = array();
    foreach($members as $m){
      if (strcmp($muri, $m['x'])!==0){ 
        $toReturn =  $toReturn.$td;
        $td = ")</li>\n";
	if (!isset($m['l']) || strcmp($m['l'], "")===0) {
	  $toReturn =  $toReturn.'<li><a href="javascript:showMember(\''.$m['x'].'\');">'.getLabel($m['x']).'</a> (<a href="javascript:changeClass(\''.$m['t'].'\');">'.getLabel($m['t']).'</a>';
	  $ta = array();
	  $ta[$m['t']] = 1;
	}
	else{
	  $toReturn =  $toReturn.'<li><a href="javascript:showMember(\''.$m['x'].'\');">'.$m['l'].'</a> (<a href="javascript:changeClass(\''.$m['t'].'\');">'.getLabel($m['t']).'</a>';
	  $ta = array();
	  $ta[$m['t']] = 1;
	}
        $muri = $m['x'];
      }
      elseif (!isset($ta[$m['t']])) {
	$toReturn =  $toReturn.' <a href="javascript:changeClass(\''.$m['t'].'\');">'.getLabel($m['t']).'</a>';
	$ta[$m['t']] = 1;
      }
    }
    $toReturn =  $toReturn.$td;
    $toReturn =  $toReturn."</ul>\n";
    return $toReturn;
  }

  function LDIFooter(){
    return "</div>\n</body>";
  }

function LDIMember($theMember, $endpoint){
  if (strcmp($theMember, "fake member")===0) return "please select a member";
  $memberInfo = getMemberInfo($theMember, $endpoint);
  // print_r($memberInfo);
  $toReturn = '<div ID="memberInfo">';
  if (isset($memberInfo[0]['http://www.w3.org/2000/01/rdf-schema#label'])){
    $toReturn =  $toReturn."<h3>".$memberInfo[0]['http://www.w3.org/2000/01/rdf-schema#label'][0].' <a href="javascript:LDIMBack();"><img src="images/back.png" height=14 /></a></h3>'."\n";
  }
  else { 
    $toReturn =  $toReturn."<h3>".getLabel($theMember).' <a href="javascript:LDIMBack();"><img src="images/back.png" height=14 /></a></h3>'."\n";
  }
  $toReturn =  $toReturn.'<div ID="memberURI">'.$theMember."</div>\n";
  $toReturn =  $toReturn.'<div ID="memberClasses">';
  foreach($memberInfo[0]['http://www.w3.org/1999/02/22-rdf-syntax-ns#type'] as $theClass){
    $toReturn =  $toReturn.'<a href="javascript:changeClass(\''.$theClass.'\');">'.getLabel($theClass)."</a> \n";    
  }
  $toReturn = $toReturn."<div>";
  $toReturn = $toReturn."<table>";
  foreach($memberInfo[0] as $p => $vs){
    if (strcmp($p, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type')!==0 && strcmp($p, 'http://www.w3.org/2000/01/rdf-schema#label')!==0){
      $toReturn = $toReturn."<tr><th>".getLabel($p)."</th><td><ul>\n";
      foreach($vs as $v){
	if (strcmp(getLabel($v), $v) ===0){ 
	  $toReturn = $toReturn."<li>".getLabel($v)."</li>";
	}
	else {
	  $toReturn = $toReturn.'<li><a href="javascript:showMember(\''.getURI($v).'\');">'.getLabel($v)."</a></li>";
	}
      }
      $toReturn = $toReturn."</ul></td></tr>";
    }
  }
  foreach($memberInfo[1] as $p => $vs){
    if (strcmp($p, 'http://www.w3.org/1999/02/22-rdf-syntax-ns#type')!==0 && strcmp($p, 'http://www.w3.org/2000/01/rdf-schema#label')!==0){
      $toReturn = $toReturn."<tr><td><ul>\n";
      foreach($vs as $v){
	if (strcmp(getLabel($v), $v) ===0){ 
	  $toReturn = $toReturn."<li>".getLabel($v)."</li>";
	}
	else {
	  $toReturn = $toReturn.'<li><a href="javascript:showMember(\''.getURI($v).'\');">'.getLabel($v)."</a></li>";
	}
      }
      $toReturn = $toReturn."</ul><th>".getLabel($p)."</th></td></tr>";
    }
  }
  $toReturn = $toReturn."</table></div>\n";
  return $toReturn;
 }


?>