<?
//output

include 'db.php';
$email=urldecode($_POST['email']);
$password= md5(urldecode($_POST['password']));
$targetID= urldecode($_POST['targetID']);
$type= urldecode($_POST['type']);
$deviceName= urldecode($_POST['deviceName']);

$con = connectDB();

$query =    "SELECT id, email FROM users  WHERE email = '$email' AND password='$password'";

$result = mysqli_query($con,$query);

if ($result->num_rows==0){
	$array['error']="Invalid username or password.";
}
else{
	while($row = mysqli_fetch_array($result))
	{
		$userID = $row['id'];
	}

	$query =    "SELECT devices.type FROM users INNER JOIN devices ON users.id = devices.userID	WHERE email = '$email' AND targetID='$targetID'";
	$result = mysqli_query($con,$query);
	
	if ($result->num_rows==0){
		if($targetID!=""){
			$query = "INSERT INTO devices (targetID, type, deviceName, userID) VALUES ('$targetID', '$type', '$deviceName','$userID')";
			if (!mysqli_query($con,$query))
			{
				//echo(mysqli_errno($con));
				$array['error']="Signed in but cannot register device. Error: " . mysqli_errno($con);
			}
			else{
				$array['message']="Successfuly logged in and device registered.";
			}
		}	
		
	}
	else{
		$array['message']="Successfuly logged in.";
	}
}
echo json_encode($array);
?>