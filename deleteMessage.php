<?
include 'db.php';
$con = connectDB();
$id=urldecode($_POST['id']);
$email=urldecode($_POST['email']);
if($id=="all"){
	$query =    "SELECT id, fileName FROM messages WHERE email='$email';";
}
else{
	$query =    "SELECT id, fileName FROM messages WHERE  `id`='$id' AND 'email='$email';";
}
$result = mysqli_query($con,$query);
$ids="";
while($row = mysqli_fetch_array($result))
{
	$ids.="'".$row['id']."',";
	if($row['filename']!=""){
		unlink('uploads/'.$row['email'].'/'.$row['filename']);
	}
}

$ids=substr($ids, 0, strlen($ids)-1);

$query = "DELETE FROM messages WHERE `id`IN ($ids)";
echo $query;
	if (!mysqli_query($con,$query))
	{
	    //action not failing to save
	}
	else{
		//action for success
	}
mysqli_close($con);

?>