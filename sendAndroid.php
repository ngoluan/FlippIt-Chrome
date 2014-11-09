<?
include 'db.php';
include 'saveMessage.php';
// Replace with real BROWSER API key from Google APIs
$apiKey = "AIzaSyBcrlHCyp7sn__vc_I0oH0nLZ4eJPOm6lI";

$email=$_POST['email'];
$targetID=$_POST["targetID"];
$message=$_POST['message'];
$fileName=$_POST['fileName'];
$content=array("message"=>$message, "fileName"=>$fileName);

$registrationIDs = array($targetID);


$url = 'https://android.googleapis.com/gcm/send';

$fields = array(
                'registration_ids'  => $registrationIDs,
                'data'              => array( "message" => $content ),
                );

$headers = array(
                    'Authorization: key=' . $apiKey,
                    'Content-Type: application/json'
                );

// Open connection
$ch = curl_init();

// Set the url, number of POST vars, POST data
curl_setopt( $ch, CURLOPT_URL, $url );
curl_setopt( $ch, CURLOPT_POST, true );
curl_setopt( $ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );

curl_setopt( $ch, CURLOPT_POSTFIELDS, json_encode( $fields ) );

// Execute post
$result = curl_exec($ch);

// Close connection
curl_close($ch);

echo $result;
saveMessage($email, $targetID, $message, $fileName);
?>