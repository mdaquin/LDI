<?php

include_once("arc2/ARC2.php");
include_once("conf/conf.php");

function getLocalName($u){
  $pos = strpos($u,'#');
  if($pos === false) {
    $pos = strrpos($u, '/');
  }
  return substr($u, $pos+1);
}

function getLabel($u){
   if (strpos($u, "xlabelx") === false) {
     if (strcmp(substr($u, 0, 4), "http") === 0){
       return getLocalName($u);
     } else{
       return $u;
     }
   } else {
      $vals = split("xlabelx", $u);
      return $vals[1];
   }
}

function getURI($u){
  if (strpos($u, "xlabelx") === false) {
    return $u;
  } else {
     $vals = split("xlabelx", $u);
     return $vals[0];
  }
}

function getLabelInData($u){
  return getLocalName($u);
}

function getInstanceNumber ($theClass, $endpoint){
  $qc = "select distinct ?x where {?x <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <".$theClass.">} LIMIT 2000";
  // echo htmlentities($qc);
  $results = runQuery($qc, $endpoint);
  // print_r($results);
  return count($results);
}


function getAllSubclasses($theClass, $endpoint){
  $qc = "select distinct ?x where {?x <http://www.w3.org/2000/01/rdf-schema#subClassOf> <".$theClass.">} ORDER BY ?x LIMIT 100";
  $results = runQuery($qc, $endpoint);
  $toReturn = array();
  $index = 0;
  foreach ($results as $r){
    if (strcmp($r['x'], $theClass)!==0) {
      if (strcmp(substr($r['x'], 0, 2), "_:")!==0){
	$toReturn[$index] = $r['x'];
	$index = $index + 1;
      }
    }
  }
  return $toReturn;
}

function getDirectSubclasses($theClass, $endpoint){
  $qc = "select distinct ?x ?y where {?x <http://www.w3.org/2000/01/rdf-schema#subClassOf> <".$theClass.">. ?y <http://www.w3.org/2000/01/rdf-schema#subClassOf> <".$theClass.">. ?x <http://www.w3.org/2000/01/rdf-schema#subClassOf> ?y. FILTER(isIRI(?x)). FILTER(isIRI(?y)). FILTER (?x != ?y)} ORDER BY ?x LIMIT 500";
  // echo htmlentities($qc)."<br/>";
  $results = runQuery($qc, $endpoint);
  $sco = array();
  $list = array();
  $index = 0;
  foreach ($results as $r){
    if (!isset($sco[$r['x']])) {
      $sco[$r['x']] = $r['y'];
      $list[$index] = $r['x'];
      $index = $index+1;
    }
    else {
     $sco[$r['x']] =  $sco[$r['x']]."|".$r['y'];
    }
  }
  $index = 0;
  $toReturn = array();
  foreach ($list as $l){
    $keepit = 1;
    $lscs = $sco[$l];
    $vals = split("\\|", $lscs);
    foreach ($vals as $val){
      if (strcmp($l, $theClass)===0){
	$keepit = 0; break;
      }
      if (strpos($sco[$theClass], $l)!==false){
	  $keepit = 0; break;
      }
      // if $val is not the class we look for 
      if (strcmp($val, $theClass)!==0){
	//	echo $l.' sco '.$val.'<br/>';
	// and is not equivalent to the current class
	if (strpos($sco[$val], $l)===false) {
	  // and is not equivalent to the class we look for
	  if (strpos($sco[$theClass], $val)===false){
	    $keepit = 0; break;
	  }
	}
      }
    }
    if ($keepit===1){
      $toReturn[$index]=$l;
      $index = $index +1;
    }
  }
  return $toReturn;
}


// TODO: remove language URIs...
function getAppliedProperties($theClass, $endpoint){
  $qc = "select ?p ?v where {?x a <".$theClass.">. ?x ?p ?v. FILTER (?p != <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>) } ORDER BY ?p ?v LIMIT 10000";
  // echo htmlentities($qc)."<br/>";
  $results = runQuery($qc, $endpoint);
   $toReturn = array();
   $toReturn[0] = array();
   $toReturn[1] = array();
   foreach ($results as $r){
     if (!isset($toReturn[0][$r['p']])) {
       $toReturn[0][$r['p']] = array();
       $toReturn[0][$r['p']]['number'] = 1;
       $toReturn[0][$r['p']][$r['v']] = 1;
     }
     else {
       if (isset($toReturn[0][$r['p']][$r['v']])){
 	$toReturn[0][$r['p']][$r['v']] = $toReturn[0][$r['p']][$r['v']] +1;
       } 
       else {
	 $toReturn[0][$r['p']]['number'] = $toReturn[0][$r['p']]['number']+1;
	 $toReturn[0][$r['p']][$r['v']] = 1;
       }
     }
   }
   $qc = "select ?p ?c where {?x a <".$theClass.">. ?x ?p ?v. ?v a ?c FILTER (?p != <http://www.w3.org/1999/02/22-rdf-syntax-ns#type>).FILTER (?c != <http://www.w3.org/2000/01/rdf-schema#Resource>).FILTER (?c != <http://www.w3.org/2002/07/owl#Thing>). FILTER (?c != <http://www.w3.org/2002/07/owl#NamedIndividual>) } ORDER by ?p LIMIT 5000";
   $results = runQuery($qc, $endpoint);
   foreach ($results as $r){
     if (isset($r['c'])){
       if (!isset($toReturn[1][$r['p']])) {
	 $toReturn[1][$r['p']] = array();
	 $toReturn[1][$r['p']]['number'] = 1;
	 $toReturn[1][$r['p']][$r['c']] = 1;
       }
       else {
	 if (isset($toReturn[1][$r['p']][$r['c']])){
	   $toReturn[1][$r['p']][$r['c']] = $toReturn[1][$r['p']][$r['c']]+1;
	 } 
	 else {
	   $toReturn[1][$r['p']]['number'] = $toReturn[1][$r['p']]['number']+1;
	   $toReturn[1][$r['p']][$r['c']] = 1;
	 }
       }
     }
   }
 return $toReturn;
}

function getMemberList($theClass, $endpoint){
  $qc = "select distinct ?x ?l ?t where {?x a <".$theClass.">. ?x a ?t. OPTIONAL {?x <http://www.w3.org/2000/01/rdf-schema#label> ?l}.FILTER (?t != <http://www.w3.org/2000/01/rdf-schema#Resource>).FILTER (?t != <http://www.w3.org/2002/07/owl#Thing>). FILTER(isIRI(?t)). FILTER (?t != <http://www.w3.org/2002/07/owl#NamedIndividual>) } ORDER BY ?l LIMIT 2000";
  $results = runQuery($qc, $endpoint);
  return $results;
}


function getMemberInfo($theMember, $endpoint){
  $qc = "select distinct ?p ?v ?l where {<".$theMember."> ?p ?v. OPTIONAL {?v <http://www.w3.org/2000/01/rdf-schema#label> ?l}. FILTER (?v != <http://www.w3.org/2000/01/rdf-schema#Resource>).FILTER (?v != <http://www.w3.org/2002/07/owl#Thing>) FILTER (?v != <http://www.w3.org/2002/07/owl#NamedIndividual>). FILTER(isIRI(?v)||isLiteral(?v))} LIMIT 10000";
  $results = runQuery($qc, $endpoint);
  // echo htmlentities($qc)."<br/>";
  //echo "--".$endpoint."--";
   $toReturn = array();
   $toReturn[0] = array();
   $toReturn[1] = array();
   foreach ($results as $result){
     if (!isset($toReturn[0][$result['p']])){
       $toReturn[0][$result['p']] = array();
     }
     if (!isset($result['l'])) { $toReturn[0][$result['p']][] = $result['v']; }
     else {  $toReturn[0][$result['p']][] = $result['v'].'xlabelx'.$result['l']; } 
   }
   $qc = "select distinct ?p ?v ?l where {?v ?p <".$theMember.">. OPTIONAL {?v <http://www.w3.org/2000/01/rdf-schema#label> ?l}.FILTER (?v != <http://www.w3.org/2000/01/rdf-schema#Resource>).FILTER (?v != <http://www.w3.org/2002/07/owl#Thing>). FILTER(?v != <http://www.w3.org/2002/07/owl#NamedIndividual>) } LIMIT 5000";
   $results = runQuery($qc, $endpoint);
   // echo htmlentities($qc)."<br/>";
   // print_r($results);
   foreach ($results as $result){
     if (!isset($toReturn[1][$result['p']])){
       $toReturn[1][$result['p']] = array();
     }
    if (!isset($result['l'])) { $toReturn[1][$result['p']][] = $result['v']; }
     else {  $toReturn[1][$result['p']][] = $result['v'].'xlabelx'.$result['l']; }  
    //    $toReturn[1][$result['p']][] = $result['v'];
   }
  return $toReturn;
}

// needs caching...
function runQuery($query, $endpoint){
  $config = array('remote_store_endpoint' => $endpoint,);
  $store = ARC2::getRemoteStore($config);
  $rows = $store->query($query, 'rows');
  //  print_r($store->getErrors());
  // print_r($rows);
  return $rows;
}



?>