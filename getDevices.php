<?
include 'db.php';
$email=urldecode($_POST['email']);

$con = connectDB();

$query =    "SELECT devices.deviceName, devices.type, devices.targetID FROM users INNER JOIN devices ON users.id = devices.userID
	WHERE email = '$email'";
$result = mysqli_query($con,$query);

$devices = array();
while($row = mysqli_fetch_array($result))
{
	array_push($devices, array('name'=>$row['deviceName'],targetID=>$row['targetID'], type=>$row['type']));
}

echo json_encode($devices);
?>