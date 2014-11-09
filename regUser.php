<?
include 'db.php';

$email=urldecode($_POST['email']);
$password= md5(urldecode($_POST['password']));
$targetID= urldecode($_POST['targetID']);
$type= urldecode($_POST['type']);
$deviceName= urldecode($_POST['deviceName']);

$con = connectDB();

$query =    "SELECT email FROM users WHERE email = '$email'";

$result = mysqli_query($con,$query);

if ($result->num_rows==0){
    $query = "INSERT INTO users (email, password) VALUES ('$email', '$password')";
    if (!mysqli_query($con,$query))
    {
        echo(mysqli_errno($con));
        exit();
    }

	$query =    "SELECT id, email FROM users  WHERE email = '$email' AND password='$password'";

	$result = mysqli_query($con,$query);

	while($row = mysqli_fetch_array($result))
	{
		$userID = $row['id'];
	}

	$query =    "SELECT devices.type FROM users INNER JOIN devices ON users.id = devices.userID	WHERE email = '$email'";
	$result = mysqli_query($con,$query);
	if ($result->num_rows==0){
		$query = "INSERT INTO devices (targetID, type, deviceName, userID) VALUES ('$targetID', '$type', '$deviceName','$userID') ON DUPLICATE KEY UPDATE id=LAST_INSERT_ID(id)";
		if (!mysqli_query($con,$query))
		{
		    //echo(mysqli_errno($con));
		    $array['message']="Successsfully registered but cannot register device. Error: " . mysqli_errno($con);
		    $array['code']=2;
		}
		else{
			$array['message']="Successfuly registered.";
		    $array['code']=0;
		}
	}
	else{
		$array['message']="Successfuly registered.";
	    $array['code']=0;
	}

}
else{

    $array['response']['message']="User already registered.";
    $array['response']['code']=1;
}
echo json_encode($array);
?>