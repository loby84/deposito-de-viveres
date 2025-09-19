<?php
class Response {

    /**
     * Respuesta de éxito
     *
     * @param mixed $data  Datos a devolver (array, objeto, etc.)
     * @param string $message Mensaje de la respuesta
     */
    public static function success($data = null, $message = '') {
        http_response_code(200);
        echo json_encode([
            'success' => true,
            'message' => $message,
            'data' => $data
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }

    /**
     * Respuesta de error
     *
     * @param string $message Mensaje de error
     * @param int $statusCode Código HTTP (400 por defecto)
     */
    public static function error($message = 'Error desconocido', $statusCode = 400) {
        http_response_code($statusCode);
        echo json_encode([
            'success' => false,
            'message' => $message,
            'data' => null
        ], JSON_UNESCAPED_UNICODE);
        exit();
    }
}
