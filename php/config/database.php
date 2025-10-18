<?php

/**
 * Configuração de conexão com banco de dados
 * Agora usando variáveis de ambiente para segurança
 */

require_once __DIR__ . '/env.php';

// Pega as configurações do .env
$host = getenv('DB_HOST');
$database = getenv('DB_NAME');
$username = getenv('DB_USER');
$password = getenv('DB_PASS');

// Cria conexão
$conn = new mysqli($host, $username, $password, $database);

// Verifica conexão
if ($conn->connect_error) {
    // Em produção, NÃO mostre detalhes do erro!
    if (getenv('APP_ENV') === 'production') {
        die(json_encode([
            'status' => 'erro',
            'mensagem' => 'Erro ao conectar ao banco de dados'
        ]));
    } else {
        // Apenas em desenvolvimento mostra o erro real
        die("Erro de conexão: " . $conn->connect_error);
    }
}

// Define charset para evitar problemas com acentuação
$conn->set_charset("utf8mb4");

/**
 * Função auxiliar para fechar conexão
 */
function fecharConexao($conn) {
    if ($conn) {
        $conn->close();
    }
}