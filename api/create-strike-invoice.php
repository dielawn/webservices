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

// Get posted data
$data = json_decode(file_get_contents("php://input"));

if (!isset($data->amount)) {
    echo json_encode([
        'success' => false,
        'message' => 'Amount is required'
    ]);
    exit();
}

try {
    $ch = curl_init();

    // First, create a Strike invoice
    curl_setopt($ch, CURLOPT_URL, 'https://api.strike.me/v1/invoices');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'amount' => [
            'currency' => 'USD',
            'amount' => $data->amount / 100 // Convert sats to USD
        ],
        'description' => isset($data->memo) ? $data->memo : 'Contact Form Access',
        'correlationId' => uniqid('rmwh_')
    ]));

    $headers = [
        'Authorization: Bearer ' . $apiKey,
        'Content-Type: application/json'
    ];

    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    $result = curl_exec($ch);
    
    if (curl_errno($ch)) {
        throw new Exception(curl_error($ch));
    }
    
    $response = json_decode($result);

    // Get the BOLT11 invoice
    curl_setopt($ch, CURLOPT_URL, 'https://api.strike.me/v1/invoices/' . $response->invoiceId . '/quote');
    curl_setopt($ch, CURLOPT_POST, 1);
    
    $quoteResult = curl_exec($ch);
    
    if (curl_errno($ch)) {
        throw new Exception(curl_error($ch));
    }
    
    curl_close($ch);
    
    $quoteResponse = json_decode($quoteResult);

    echo json_encode([
        'success' => true,
        'invoice' => [
            'id' => $response->invoiceId,
            'paymentRequest' => $quoteResponse->lnInvoice,
            'expiryMinutes' => 60 // Strike invoices typically expire in 60 minutes
        ]
    ]);

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>