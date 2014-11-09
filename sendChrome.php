<?
include 'db.php';
include 'saveMessage.php';
$email=urldecode($_POST['email']);
$targetID=urldecode($_POST['targetID']);
$message=urldecode($_POST['message']);
$fileName=urldecode($_POST['fileName']);

$con = connectDB();

$apiKey = "AIzaSyBcrlHCyp7sn__vc_I0oH0nLZ4eJPOm6lI";

$content=array("message"=>$message, "fileName"=>$fileName);

$data = json_encode(array(
	        'registration_ids' => array($targetID),
	        'data'=> $content
	    ));

    $ch = curl_init();
    $curlConfig = array(
        CURLOPT_URL            => "https://android.googleapis.com/gcm/send",
        CURLOPT_POST           => true,
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POSTFIELDS     => $data,
        CURLOPT_SSL_VERIFYPEER => false,
        CURLOPT_HTTPHEADER     => array(
        	'Authorization: key= ' . $apiKey,
            'Content-Type: application/json'
        )
    );
    curl_setopt_array($ch, $curlConfig);
    curl_setopt($ch, CURLOPT_VERBOSE, true);
    curl_setopt($ch, CURLINFO_HEADER_OUT, TRUE);
    $result = curl_exec($ch);
    echo $data . '<br>'.$access_token.'<br>';
    echo curl_getinfo($ch, CURLINFO_HEADER_OUT);
    echo $result;
    saveMessage($email, $targetID, $message, $fileName);
?>