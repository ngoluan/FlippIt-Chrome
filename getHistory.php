<?
include 'db.php';
$email=urldecode($_POST['email']);
$start=urldecode($_POST['start']);
$total=urldecode($_POST['total']);
if($start==""){
	$start = 0;
}
if($total==""){
	$total = 20;
}
$con = connectDB();

$query =    "SELECT id, dateTime, targetID, message, fileName FROM messages  WHERE email = '$email' ORDER BY dateTime DESC LIMIT $start, $total";

$result = mysqli_query($con,$query);

$history = array();
while($row = mysqli_fetch_array($result))
{
	array_push($history, array(
		'id'=>$row['id'], 'dateTime'=>$row['dateTime'],'targetID'=>$row['targetID'], 'message'=>stripslashes($row['message']), 'fileName'=>$row['fileName']));
}

echo json_encode($history);
?>