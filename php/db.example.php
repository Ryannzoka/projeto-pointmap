<?php
// db.example.php - exemplo de configuração para conexão com banco

$host = 'localhost';       // endereço do servidor MySQL
$user = 'seu_usuario';     // usuário do banco de dados
$pass = 'sua_senha';       // senha do banco de dados
$db   = 'nome_do_banco';   // nome do banco

$conn = new mysqli($host, $user, $pass, $db);

if ($conn->connect_error) {
    die("Erro na conexão: " . $conn->connect_error);
}