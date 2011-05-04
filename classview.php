<!DOCTYPE html> 
<html lang="en"> 
<?php
    include_once("conf.php");
    include_once("templates.php");
 
    if (isset($_GET["class"])) {$theClass = $_GET["class"];}
    else {$theClass = $defaultclass;}
    if (isset($_GET["endpoint"])) {$endpoint = $_GET["endpoint"];}
    else {$endpoint = $defaultendpoint;} 
?>

<?php
    echo LDIHeader($theClass);
?>

<div ID="LDITitle">Loading...</div>


<table>
  <tr><td valign=top>
<div ID="classSummary">
   LOADING...
</div>

<div ID="propSummary">
   LOADING...
</div>

<div ID="members">
   LOADING...
</div>
</td><td valign=top>  
<div ID="member">

</div>
</td></tr></table>

<script type="text/javascript">

<?php
    echo 'var theClass = "'.$theClass.'";'."\n";
    echo 'var endpoint = "'.$endpoint.'";'."\n";
?>

var theMember = "fake member";

changeClass(theClass);

    addWidget("scs", "More specific classes", "classSummary");
    addWidget("props", "Properties", "propSummary");
    addWidget("members", "Members", "members");
    addWidget("member", "Member", "member");


</script>



<?php
echo LDIFooter();
?>



</html>
