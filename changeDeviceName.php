<?
include 'db.php';
$targetID= urldecode($_POST['targetID']);
$deviceName= urldecode($_POST['deviceName']);

$con = connectDB();

$query =    "UPDATE devices SET deviceName = '$deviceName' WHERE targetID = '$targetID'";

$result = mysqli_query($con,$query);

?>