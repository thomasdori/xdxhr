<?php 
	if (isset($_REQUEST['data'])) {
	
		$data = $_REQUEST['data'];
	
		if (isset($_GET['callback'])) {
	  		echo $_GET['callback'] . "('" . $data . "');";
		} else {
			echo $data;
		}
	} else {
		echo "no data";
	}
?>