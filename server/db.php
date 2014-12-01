<?
function connectDB(){
    $con = mysqli_connect("localhost","local592_lngo","Terranova1","local592_pass");
	if (mysqli_connect_errno())
	{
		echo "Failed to connect to MySQL: " . mysqli_connect_error();
	}
	return $con;
}

?>