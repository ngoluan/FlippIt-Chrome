<?

function sendMessage($email, $targetID, $targetType, $message, $fileName, $saveMessage){
	
if ($targetType=="android" || $targetType=="chrome"){
	$apiKey = "AIzaSyBcrlHCyp7sn__vc_I0oH0nLZ4eJPOm6lI";
	$content=array("message"=>$message, "fileName"=>$fileName);
	$url = 'https://android.googleapis.com/gcm/send';
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
	curl_setopt( $ch, CURLOPT_SSL_VERIFYPEER, false);
	curl_setopt( $ch, CURLOPT_RETURNTRANSFER, true );
	
	$fields=array();
	$fields['registration_ids']= array($targetID);
	if ($targetType=="android"){
		$fields['data'] =  array( "message" => $content );
	}
	else{
		$fields['data'] =  $content;
	}
	curl_setopt( $ch, CURLOPT_POSTFIELDS, json_encode( $fields ) );
	

	// Execute post
	$result = curl_exec($ch);

	// Close connection
	curl_close($ch);
	
	$response=array();
	$response = json_decode($result, true);
	if ($response['success']!=1){
		$array['error']="Error: Message did not send. ";
		$array['error']=$result;
	}
	else{
		$array['message']=$result;
	}
	$array["id"]=saveMessage($email, $targetID, $message, $fileName,$saveMessage);	
	return $array;
}
}

function saveMessage($email, $targetID, $message, $fileName, $saveMessage){
	if($saveMessage=="false" && $fileName==""){
		return null;
	}
	$link = mysql_connect('localhost', 'local592_lngo', 'Terranova1');
	if (!$link) {
		die('Could not connect: ' . mysql_error());
	}
	$query = "INSERT INTO messages (email, targetID, message, fileName, saveMessage) VALUES ('$email', '$targetID', '$message','$fileName','$saveMessage')";
	mysql_select_db('local592_pass');
	mysql_query($query);
	$id = mysql_insert_id();
	mysql_close($link);
	return $id;
}
?>