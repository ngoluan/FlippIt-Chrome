<?

$files = scandir('uploads/luan.t.ngo@gmail.com');
$files = array_diff( $files, array(".", ".."));
foreach($files as $file) {
	echo $file . "<br>";
	unlink("uploads/luan.t.ngo@gmail.com/".$file);
}
?>