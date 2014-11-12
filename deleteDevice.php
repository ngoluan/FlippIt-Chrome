<?
include 'db.php';
$con = connectDB();
$targetID=urldecode($_POST['targetID']);
$email=urldecode($_POST['email']);


$query = "DELETE FROM devices WHERE `targetID`= '$targetID' AND userID IN (SELECT id FROM users WHERE email='$email')";
echo $query;
	if (!mysqli_query($con,$query))
	{
	    echo(mysqli_errno($con));
	}
	else{
		//action for success
	}
mysqli_close($con);

?>