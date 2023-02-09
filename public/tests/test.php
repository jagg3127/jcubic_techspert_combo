<?php

$users = array(
    array(
        'user'     => 'TechSpert',
        'password' => 'b',         #'LH3127IOQp'
        'id'       => 'LHVTA920'    
    ),

    array(
        'user'     => 'Pixel',
        'password' => 'b',
        'id'       => 'PIX'
    ),

    array(
        'user'     => 'DEVLIN',
        'password' => 'b',
        'id'       => 'DEV'
    )

  );

$user = $_POST['user'];
$pass = $_POST['pass'];

foreach ($users as $arr){
    if ($arr['user'] == $user && $arr['password'] == $pass) {
        echo $arr['id'];
    } else {
        echo null;
    }
}

?>