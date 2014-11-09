<?
include 'db.php';
$email=urldecode($_POST['email']);
$id=urldecode($_POST['id']);

$con = connectDB();

$query =    "SELECT id, dateTime, targetID, message, fileName FROM messages  WHERE email = '$email' AND id='$id'";

$result = mysqli_query($con,$query);

$message = array();
while($row = mysqli_fetch_array($result))
{
	array_push($message, array(
		'id'=>$row['id'], 'dateTime'=>$row['dateTime'],'targetID'=>$row['targetID'], 'message'=>stripslashes($row['message']), 'fileName'=>$row['fileName']));
}

echo json_encode($message);
?>