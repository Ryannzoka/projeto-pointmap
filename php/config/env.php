<?php

/**
 * Carrega variáveis de ambiente do arquivo .env
 * 
 * Como usar:
 * require_once 'config/env.php';
 * $apiKey = getenv('GOOGLE_MAPS_API_KEY');
 */
function carregarEnv($caminho = __DIR__ . '/../../.env') {
    if (!file_exists($caminho)) {
        throw new Exception("Arquivo .env não encontrado em: $caminho");
    }

    $linhas = file($caminho, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
    
    foreach ($linhas as $linha) {
        // Ignora comentários
        if (strpos(trim($linha), '#') === 0) {
            continue;
        }

        // Separa chave=valor
        list($chave, $valor) = explode('=', $linha, 2);
        
        $chave = trim($chave);
        $valor = trim($valor);
        
        // Remove aspas se existirem
        $valor = trim($valor, '"\'');
        
        // Define a variável de ambiente
        putenv("$chave=$valor");
        $_ENV[$chave] = $valor;
        $_SERVER[$chave] = $valor;
    }
}

// Carrega automaticamente quando o arquivo é incluído
try {
    carregarEnv();
} catch (Exception $e) {
    die("Erro ao carregar configurações: " . $e->getMessage());
}