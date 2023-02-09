<?php
$users = array(
    array(
        'user'     => 'TechSpert',
        'password' => 'LH3127IOQp',
        'id'       => 'LHVTA920'    
    ),

    array(
        'user'     => 'pointer',
        'password' => 'gocolts23',
        'id'       => 'VP58B76A'
    ),

    array(
        'user'     => 'Pixel',
        'password' => 'awsome1',
        'id'       => 'ARW2EDS4'
    ),

    
    
    
    array(
        'user'     => 'DEVLIN',
        'password' => 'b',
        'id'       => 'DEV'
    ),

    array(
        'user'     => 'a',
        'password' => 'b',         #'LH3127IOQp'
        'id'       => 'GUEST'    
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