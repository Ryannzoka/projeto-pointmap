<?php

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405); // Method Not Allowed
    echo json_encode([
        'status' => 'erro',
        'mensagem' => 'Método não permitido. Use POST.'
    ]);
    exit;
}

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/utils/Validator.php';

try {
    $validator = new Validator();
    
    $nome = $validator->validarString(
        $_POST['nome'] ?? '', 
        'Nome', 
        3,
        100
    );
    
    $descricao = $validator->validarString(
        $_POST['descricao'] ?? '', 
        'Descrição', 
        3,
        255
    );
    
    $latitude = $validator->validarLatitude($_POST['latitude'] ?? '');
    
    $longitude = $validator->validarLongitude($_POST['longitude'] ?? '');
    
    if ($validator->temErros()) {
        http_response_code(400); // Bad Request
        echo json_encode([
            'status' => 'erro',
            'mensagem' => $validator->getErrosFormatados(),
            'erros' => $validator->getErros()
        ]);
        exit;
    }
    
    $stmt = $conn->prepare("
        INSERT INTO pontos (nome, descricao, latitude, longitude, criado_em) 
        VALUES (?, ?, ?, ?, NOW())
    ");
    
    if (!$stmt) {
        throw new Exception("Erro ao preparar query: " . $conn->error);
    }
    
    $stmt->bind_param("ssdd", $nome, $descricao, $latitude, $longitude);
    
    if (!$stmt->execute()) {
        throw new Exception("Erro ao executar query: " . $stmt->error);
    }
    
    $idInserido = $stmt->insert_id;
    
    $stmt->close();
    $conn->close();
    
    http_response_code(201); // Created
    echo json_encode([
        'status' => 'sucesso',
        'id' => $idInserido,
        'mensagem' => 'Ponto cadastrado com sucesso!',
        'ponto' => [
            'id' => $idInserido,
            'nome' => $nome,
            'descricao' => $descricao,
            'latitude' => $latitude,
            'longitude' => $longitude
        ]
    ]);
    
} catch (Exception $e) {
    $mensagemErro = (getenv('APP_ENV') === 'development') 
        ? $e->getMessage() 
        : 'Erro interno ao salvar ponto.';
    
    error_log("Erro ao salvar ponto: " . $e->getMessage());
    
    http_response_code(500); // Internal Server Error
    echo json_encode([
        'status' => 'erro',
        'mensagem' => $mensagemErro
    ]);
}