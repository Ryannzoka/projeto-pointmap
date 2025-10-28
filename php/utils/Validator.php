<?php

/**
 * Classe para validação e sanitização de dados
 * 
 * Uso:
 * $validator = new Validator();
 * $nome = $validator->validarString($_POST['nome'], 'Nome', 3, 100);
 */
class Validator {
    
    private $erros = [];
    
    /**
     * Valida e sanitiza uma string
     * 
     * @param string $valor Valor a validar
     * @param string $campo Nome do campo (para mensagens de erro)
     * @param int $minLength Tamanho mínimo
     * @param int $maxLength Tamanho máximo
     * @param bool $obrigatorio Se o campo é obrigatório
     * @return string|null String sanitizada ou null se inválido
     */
    public function validarString($valor, $campo, $minLength = 1, $maxLength = 255, $obrigatorio = true) {
        $valor = trim($valor);
        
        if (empty($valor)) {
            if ($obrigatorio) {
                $this->adicionarErro("O campo '$campo' é obrigatório.");
                return null;
            }
            return ''; // Campo opcional e vazio = OK
        }
        
        if (mb_strlen($valor) < $minLength) {
            $this->adicionarErro("O campo '$campo' deve ter no mínimo $minLength caracteres.");
            return null;
        }
        
        if (mb_strlen($valor) > $maxLength) {
            $this->adicionarErro("O campo '$campo' deve ter no máximo $maxLength caracteres.");
            return null;
        }
        
        $valor = strip_tags($valor);
        $valor = htmlspecialchars($valor, ENT_QUOTES, 'UTF-8');
        
        return $valor;
    }
    
    /**
     * Valida latitude (-90 a 90)
     * 
     * @param mixed $valor Valor a validar
     * @return float|null Latitude válida ou null
     */
    public function validarLatitude($valor) {
        $valor = trim($valor);
        
        if (empty($valor)) {
            $this->adicionarErro("Latitude é obrigatória.");
            return null;
        }
        
        if (!is_numeric($valor)) {
            $this->adicionarErro("Latitude deve ser um número válido.");
            return null;
        }
        
        $latitude = floatval($valor);
        
        if ($latitude < -90 || $latitude > 90) {
            $this->adicionarErro("Latitude deve estar entre -90 e 90.");
            return null;
        }
        
        return $latitude;
    }
    
    /**
     * Valida longitude (-180 a 180)
     * 
     * @param mixed $valor Valor a validar
     * @return float|null Longitude válida ou null
     */
    public function validarLongitude($valor) {
        $valor = trim($valor);
        
        if (empty($valor)) {
            $this->adicionarErro("Longitude é obrigatória.");
            return null;
        }
        
        if (!is_numeric($valor)) {
            $this->adicionarErro("Longitude deve ser um número válido.");
            return null;
        }
        
        $longitude = floatval($valor);
        
        if ($longitude < -180 || $longitude > 180) {
            $this->adicionarErro("Longitude deve estar entre -180 e 180.");
            return null;
        }
        
        return $longitude;
    }
    
    /**
     * Valida um ID (inteiro positivo)
     * 
     * @param mixed $valor Valor a validar
     * @return int|null ID válido ou null
     */
    public function validarId($valor) {
        $valor = trim($valor);
        
        if (empty($valor)) {
            $this->adicionarErro("ID é obrigatório.");
            return null;
        }
        
        if (!filter_var($valor, FILTER_VALIDATE_INT)) {
            $this->adicionarErro("ID deve ser um número inteiro válido.");
            return null;
        }
        
        $id = intval($valor);
        
        if ($id <= 0) {
            $this->adicionarErro("ID deve ser maior que zero.");
            return null;
        }
        
        return $id;
    }
    
    /**
     * Adiciona um erro à lista
     * 
     * @param string $mensagem Mensagem de erro
     */
    private function adicionarErro($mensagem) {
        $this->erros[] = $mensagem;
    }
    
    /**
     * Verifica se há erros
     * 
     * @return bool True se tem erros
     */
    public function temErros() {
        return count($this->erros) > 0;
    }
    
    /**
     * Retorna todos os erros
     * 
     * @return array Lista de erros
     */
    public function getErros() {
        return $this->erros;
    }
    
    /**
     * Retorna erros como string (separados por <br>)
     * 
     * @return string Erros formatados
     */
    public function getErrosFormatados() {
        return implode('<br>', $this->erros);
    }
    
    /**
     * Limpa todos os erros
     */
    public function limparErros() {
        $this->erros = [];
    }
    
    /**
     * Sanitiza uma string para uso seguro em HTML
     * (Função auxiliar pública)
     * 
     * @param string $valor Valor a sanitizar
     * @return string Valor sanitizado
     */
    public static function sanitizarHtml($valor) {
        return htmlspecialchars($valor, ENT_QUOTES, 'UTF-8');
    }
}