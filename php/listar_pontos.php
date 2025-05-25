<?php

require 'db.php';

$sql = "SELECT id, nome, descricao, latitude, longitude FROM pontos";
$result = $conn->query($sql);

$pontos = [];

if ($result && $result->num_rows > 0) {
    while ($row = $result->fetch_assoc()) {
        $pontos[] = $row;
    }
}

$conn->close();

header('Content-Type: application/json');
echo json_encode($pontos);
