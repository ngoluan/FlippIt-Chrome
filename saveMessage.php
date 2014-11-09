<?
function saveMessage($email, $targetID, $message, $fileName){
	$con = connectDB();
	$message = addslashes($message);
	$query = "INSERT INTO messages (email, targetID, message, fileName) VALUES ('$email', '$targetID', '$message','$fileName')";
		if (!mysqli_query($con,$query))
		{
		    //action not failing to save
		}
		else{
			//action for success
		}
	mysqli_close($con);
}
?>