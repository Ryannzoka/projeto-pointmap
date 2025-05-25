<?php

require 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    parse_str(file_get_contents("php://input"), $_DELETE);
    $id = $_DELETE['id'];

    $stmt = $conn->prepare("DELETE FROM pontos WHERE id = ?");
    $stmt->bind_param("i", $id);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'sucesso']);
    } else {
        echo json_encode(['status' => 'erro', 'mensagem' => $stmt->error]);
    }

    $stmt->close();
    $conn->close();
}
