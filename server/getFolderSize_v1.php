<?
$email=urldecode($_POST['email']);
$storeFolder = '/home/local592/public_html/pass/uploads/'.$email;   //2
$io = popen ( '/usr/bin/du -sk ' . $storeFolder, 'r' );
$size = fgets ( $io, 4096);
$size = substr ( $size, 0, strpos ( $size, "\t" ) );
pclose ( $io );
if($size==false){
	$size=0;
}
$folderSize['size']=$size;
echo json_encode($folderSize);
?>