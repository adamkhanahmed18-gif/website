<?php
header('Content-Type: application/json');
header('X-Content-Type-Options: nosniff');

// Only accept POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Method not allowed']);
    exit;
}

// Honeypot check
if (!empty($_POST['botcheck'])) {
    echo json_encode(['success' => true]); // Silently discard bots
    exit;
}

$to      = 'contact@ghafoors.uk';
$site    = 'Ghafoors Immigration';

// Sanitise inputs
function clean($val) {
    return htmlspecialchars(strip_tags(trim($val)), ENT_QUOTES, 'UTF-8');
}

$first_name = clean($_POST['first_name'] ?? '');
$last_name  = clean($_POST['last_name']  ?? '');
$email      = filter_var(trim($_POST['email'] ?? ''), FILTER_VALIDATE_EMAIL);
$phone      = clean($_POST['phone']      ?? '');
$visa_type  = clean($_POST['visa_type']  ?? '');
$message    = clean($_POST['message']    ?? '');

// Basic validation
if (!$first_name || !$last_name || !$email || !$visa_type || strlen(strip_tags(trim($_POST['message'] ?? ''))) < 10) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Missing required fields']);
    exit;
}

$name = "$first_name $last_name";

$subject = "New Enquiry \u{2014} $site";

$body  = "You have received a new enquiry from the $site website.\n\n";
$body .= "Name:       $name\n";
$body .= "Email:      $email\n";
$body .= "Phone:      " . ($phone ?: 'Not provided') . "\n";
$body .= "Visa Type:  $visa_type\n\n";
$body .= "Message:\n$message\n\n";
$body .= "---\n";
$body .= "Submitted: " . date('d M Y, H:i') . " (server time)\n";
$body .= "IP: " . ($_SERVER['REMOTE_ADDR'] ?? 'unknown') . "\n";

$headers  = "From: $site <no-reply@ghafoors.uk>\r\n";
$headers .= "Reply-To: $name <$email>\r\n";
$headers .= "X-Mailer: PHP/" . phpversion() . "\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: text/plain; charset=UTF-8\r\n";

$sent = mail($to, $subject, $body, $headers);

if ($sent) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Mail delivery failed']);
}
