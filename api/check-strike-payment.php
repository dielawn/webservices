<?php
// At the top of your PHP file
require_once __DIR__ . '/vendor/autoload.php';
$dotenv = Dotenv\Dotenv::createImmutable(__DIR__);
$dotenv->load();

// Then access your variables
$apiKey = getenv('STRIKE_API_KEY');

header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

$data = json_decode(file_get_contents("php://input"));

if (!isset($data->invoiceId)) {
    echo json_encode([
        'success' => false,
        'message' => 'Invoice ID is required'
    ]);
    exit();
}

try {
    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, 'https://api.strike.me/v1/invoices/' . $data->invoiceId);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);

    $headers = [
        'Authorization: Bearer ' . $apiKey
    ];

    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    $result = curl_exec($ch);
    
    if (curl_errno($ch)) {
        throw new Exception(curl_error($ch));
    }
    
    curl_close($ch);
    
    $response = json_decode($result);

    echo json_encode([
        'success' => true,
        'paid' => $response->state === 'PAID'
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>