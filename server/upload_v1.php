<?php
include 'db.php';
include 'sendFunction_v1.php';
/* foreach (getallheaders() as $name => $value) {
	if($name=="Email"){
		$email = $value;
	}
} */

$email=$_POST['email'];
$targetID=$_POST["targetID"];
$targetType=$_POST['targetType'];
$message=$_POST['message'];
$fileName=$_POST['fileName'];
$saveMessage=$_POST['saveMessage'];

$ds          = DIRECTORY_SEPARATOR;  //1
$storeFolder = '../uploads/'.$email;   //2
$io = popen ( '/usr/bin/du -sk ' . $storeFolder, 'r' );
$size = fgets ( $io, 4096);
$size = substr ( $size, 0, strpos ( $size, "\t" ) );
pclose ( $io );

if($size>1024*10){
	$array['message']="You have exceeded your drive limits. Delete some files first then try again.";
	echo json_encode($array);
	exit();
}
print_r($_FILES);
if (!empty($_FILES)) {
    $tempFile = $_FILES['file']['tmp_name'];          //3
    $targetPath = dirname( __FILE__ ) . $ds. $storeFolder . $ds;  //4
	$targetFileName = str_replace(" ","_",$_FILES['file']['name']);
	$targetFileName= preg_replace("/[^a-z0-9\.]/", "", strtolower($targetFileName));
    $targetFile =  $targetPath. $targetFileName;  //5
	$fileSize = $_FILES['file']['size'];
	//echo $targetFile;
	if (!file_exists($targetPath)) {
	    mkdir($targetPath, 0777, true);
	}
    move_uploaded_file($tempFile,$targetFile); //6
	
	
    $con = connectDB();
    $query = "INSERT INTO files (userID, fileName, timeDate, fileSize) VALUES ((SELECT id FROM users WHERE email='$email'), '$targetFile', NOW(), $fileSize)";

    if (!mysqli_query($con,$query))
    {
        echo(mysqli_errno($con));
        exit();
    }
	$array = sendMessage($email, $targetID, $targetType, $message, $targetFileName,$saveMessage);
	$array['fileName'] = $targetFileName;
	echo json_encode($array);
	
    mysqli_close($con);
}
?>