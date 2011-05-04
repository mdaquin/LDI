<?php

     include_once("../conf.php");
     include_once("../templates.php");

if (isset($_GET["member"])) {$theMember = $_GET["member"];}
 else {$theMember = "test";}
if (isset($_GET["endpoint"])) {$endpoint = $_GET["endpoint"];}
 else {$endpoint = $defaultendpoint;} 
echo LDIMember($theMember, $endpoint); 
?>