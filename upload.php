<?php
include 'db.php';
foreach (getallheaders() as $name => $value) {
	if($name=="Email"){
		$email = $value;
	}
}

$ds          = DIRECTORY_SEPARATOR;  //1
$userID=urldecode($_POST['userID']);

$storeFolder = 'uploads/'.$email;   //2
if (!empty($_FILES)) {

    $tempFile = $_FILES['file']['tmp_name'];          //3

    $targetPath = dirname( __FILE__ ) . $ds. $storeFolder . $ds;  //4
	$targetFileName= preg_replace("/[^a-z0-9\.]/", "", strtolower($_FILES['file']['name']));
    $targetFile =  $targetPath. $targetFileName;  //5
	//echo $targetFile;
	if (!file_exists($targetPath)) {
	    mkdir($targetPath, 0777, true);
	}
    move_uploaded_file($tempFile,$targetFile); //6
	echo $targetFileName;
    $con = connectDB();
    $query = "INSERT INTO files (userID, fileName, timeDate) VALUES ((SELECT id FROM users WHERE email='$email'), '$targetFile', NOW())";

    if (!mysqli_query($con,$query))
    {
        echo(mysqli_errno($con));
        exit();
    }
    mysqli_close($con);
}
?>