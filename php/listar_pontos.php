<?php

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode([
        'status' => 'erro',
        'mensagem' => 'Método não permitido. Use GET.'
    ]);
    exit;
}

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/utils/Validator.php';

try {
    $sql = "
        SELECT 
            id, 
            nome, 
            descricao, 
            latitude, 
            longitude,
            criado_em
        FROM pontos 
        ORDER BY criado_em DESC
    ";
    
    $result = $conn->query($sql);
    
    if (!$result) {
        throw new Exception("Erro ao executar query: " . $conn->error);
    }
    
    $pontos = [];
    
    while ($row = $result->fetch_assoc()) {
        $pontos[] = [
            'id' => (int) $row['id'],
            'nome' => Validator::sanitizarHtml($row['nome']),
            'descricao' => Validator::sanitizarHtml($row['descricao']),
            'latitude' => (float) $row['latitude'],
            'longitude' => (float) $row['longitude'],
            'criado_em' => $row['criado_em']
        ];
    }
    
    $conn->close();
    
    http_response_code(200);
    echo json_encode($pontos, JSON_UNESCAPED_UNICODE);
    
} catch (Exception $e) {
    $mensagemErro = (getenv('APP_ENV') === 'development') 
        ? $e->getMessage() 
        : 'Erro interno ao listar pontos.';
    
    error_log("Erro ao listar pontos: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'status' => 'erro',
        'mensagem' => $mensagemErro
    ]);
}