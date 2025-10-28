<?php

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode([
        'status' => 'erro',
        'mensagem' => 'Método não permitido. Use POST.'
    ]);
    exit;
}

require_once __DIR__ . '/config/database.php';
require_once __DIR__ . '/utils/Validator.php';

try {
    parse_str(file_get_contents("php://input"), $_DELETE);
    
    $validator = new Validator();
    
    $id = $validator->validarId($_DELETE['id'] ?? '');
    
    if ($validator->temErros()) {
        http_response_code(400);
        echo json_encode([
            'status' => 'erro',
            'mensagem' => $validator->getErrosFormatados()
        ]);
        exit;
    }
    
    $stmtCheck = $conn->prepare("SELECT id FROM pontos WHERE id = ?");
    $stmtCheck->bind_param("i", $id);
    $stmtCheck->execute();
    $stmtCheck->store_result();
    
    if ($stmtCheck->num_rows === 0) {
        $stmtCheck->close();
        http_response_code(404); // Not Found
        echo json_encode([
            'status' => 'erro',
            'mensagem' => 'Ponto não encontrado.'
        ]);
        exit;
    }
    
    $stmtCheck->close();
    
    $stmt = $conn->prepare("DELETE FROM pontos WHERE id = ?");
    
    if (!$stmt) {
        throw new Exception("Erro ao preparar query: " . $conn->error);
    }
    
    $stmt->bind_param("i", $id);
    
    if (!$stmt->execute()) {
        throw new Exception("Erro ao executar query: " . $stmt->error);
    }
    
    if ($stmt->affected_rows === 0) {
        throw new Exception("Nenhum registro foi excluído.");
    }
    
    $stmt->close();
    $conn->close();
    
    http_response_code(200); // OK
    echo json_encode([
        'status' => 'sucesso',
        'mensagem' => 'Ponto excluído com sucesso!'
    ]);
    
} catch (Exception $e) {
    $mensagemErro = (getenv('APP_ENV') === 'development') 
        ? $e->getMessage() 
        : 'Erro interno ao excluir ponto.';
    
    error_log("Erro ao excluir ponto: " . $e->getMessage());
    
    http_response_code(500);
    echo json_encode([
        'status' => 'erro',
        'mensagem' => $mensagemErro
    ]);
}