<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

require_once 'vendor/autoload.php';

// Your OpenNode API key
$apiKey = 'YOUR_API_KEY';

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

    curl_setopt($ch, CURLOPT_URL, 'https://api.opennode.com/v1/charges');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'amount' => $data->amount,
        'currency' => 'SATS',
        'description' => isset($data->memo) ? $data->memo : 'Contact Form Access',
        'callback_url' => 'https://your-domain.com/api/payment-webhook.php',
        'success_url' => 'https://your-domain.com/contact-success',
        'ttl' => 10, // Invoice expires in 10 minutes
    ]));

    $headers = [
        'Authorization: ' . $apiKey,
        'Content-Type: application/json'
    ];

    curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

    $result = curl_exec($ch);
    
    if (curl_errno($ch)) {
        throw new Exception(curl_error($ch));
    }
    
    curl_close($ch);
    
    $response = json_decode($result);

    if (isset($response->data)) {
        echo json_encode([
            'success' => true,
            'invoice' => [
                'id' => $response->data->id,
                'paymentRequest' => $response->data->lightning_invoice->payreq,
                'expiryMinutes' => 10
            ]
        ]);
    } else {
        throw new Exception('Failed to create invoice');
    }

} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}
?>