<?php
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');

// Get posted data
$data = json_decode(file_get_contents("php://input"));

// Validate required fields
if (!isset($data->name) || !isset($data->email) || !isset($data->message) || !isset($data->package)) {
    echo json_encode([
        'success' => false,
        'message' => 'Missing required fields'
    ]);
    exit();
}

// Email configuration
$admin_email = "dmercill@protonmail.com"; // Change this to your email
$subject = "New Contact Form Submission - " . htmlspecialchars($data->package);

// Email to admin
$admin_message = "
<html>
<head>
    <title>New Contact Form Submission</title>
</head>
<body>
    <h2>New Contact Form Submission</h2>
    <p><strong>Name:</strong> " . htmlspecialchars($data->name) . "</p>
    <p><strong>Email:</strong> " . htmlspecialchars($data->email) . "</p>
    <p><strong>Phone:</strong> " . (isset($data->phone) ? htmlspecialchars($data->phone) : 'Not provided') . "</p>
    <p><strong>Company:</strong> " . (isset($data->company) ? htmlspecialchars($data->company) : 'Not provided') . "</p>
    <p><strong>Package:</strong> " . htmlspecialchars($data->package) . "</p>
    <p><strong>Message:</strong></p>
    <p>" . htmlspecialchars($data->message) . "</p>
</body>
</html>
";

// Auto-reply message
$client_message = "
<html>
<head>
    <title>Thank you for contacting Rocky Mountain Web Services</title>
</head>
<body>
    <h2>Thank you for reaching out!</h2>
    <p>Dear " . htmlspecialchars($data->name) . ",</p>
    <p>We've received your inquiry about our " . htmlspecialchars($data->package) . " package. Our team will review your request and get back to you within 24 hours.</p>
    <p>Here's a summary of your submission:</p>
    <ul>
        <li>Package: " . htmlspecialchars($data->package) . "</li>
        <li>Message: " . htmlspecialchars($data->message) . "</li>
    </ul>
    <p>Best regards,<br>Rocky Mountain Web Services Team</p>
</body>
</html>
";

// Headers for HTML email
$headers = "MIME-Version: 1.0" . "\r\n";
$headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
$headers .= 'From: Rocky Mountain Web Services <noreply@rockymountainwebservices.com>' . "\r\n";

try {
    // Send email to admin
    $admin_mail_sent = mail($admin_email, $subject, $admin_message, $headers);
    
    // Send auto-reply to client
    $client_mail_sent = mail($data->email, "Thank you for contacting Rocky Mountain Web Services", $client_message, $headers);
    
    if ($admin_mail_sent && $client_mail_sent) {
        echo json_encode([
            'success' => true,
            'message' => 'Your message has been sent. We\'ll be in touch soon!'
        ]);
    } else {
        throw new Exception('Failed to send email');
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Failed to send message. Please try again later.'
    ]);
}
?>