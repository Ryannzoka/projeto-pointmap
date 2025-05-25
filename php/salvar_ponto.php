<?php

require 'db.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nome = $_POST["nome"];
    $descricao = $_POST['descricao'];
    $latitude = $_POST['latitude'];
    $longitude = $_POST['longitude'];

    $stmt = $conn->prepare("INSERT INTO pontos (nome, descricao, latitude, longitude) VALUES (?, ?, ?, ?)");
    $stmt->bind_param("ssdd", $nome, $descricao, $latitude, $longitude);

    if ($stmt->execute()) {
        echo json_encode(['status' => 'sucesso', 'id' => $stmt->insert_id]);
    } else {
        echo json_encode(['status' => 'erro', 'mensagem' => $stmt->error]);
    }

    $stmt->close();
    $conn->close();
}
