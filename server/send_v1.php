<?
include 'db.php';
include 'sendFunction_v1.php';

$email=$_POST['email'];
$targetID=$_POST["targetID"];
$targetType=$_POST['targetType'];
$message=$_POST['message'];
$fileName=$_POST['fileName'];
$saveMessage=$_POST['saveMessage'];

$array = sendMessage($email, $targetID, $targetType, $message, $fileName, $saveMessage);

echo json_encode($array);
?>