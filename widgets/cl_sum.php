<?php

     include_once("../conf.php");
     include_once("../templates.php");

    if (isset($_GET["class"])) {$theClass = $_GET["class"];}
    else {$theClass = $defaultclass;}
    if (isset($_GET["endpoint"])) {$endpoint = $_GET["endpoint"];}
    else {$endpoint = $defaultendpoint;}

    echo  LDISubClassSummary($theClass, $endpoint);

?>