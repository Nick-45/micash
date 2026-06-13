<?php
require_once 'config.php';
require_once 'firestore/FirestoreClient.php';

$input = json_decode(file_get_contents("php://input"), true);
$accessToken = $input['access_token'] ?? '';
$amount = $input['amount'] ?? 0;
$recipient = $input['recipient'] ?? '';
$description = $input['description'] ?? '';
$email = $input['email'] ?? '';

if (empty($accessToken) || empty($amount) || empty($recipient)) {
    echo json_encode(["success" => false, "error" => "Missing required fields"]);
    exit;
}

$db = new FirestoreClient($accessToken);

// Verify user exists
$user = $db->getDocument('users', $email);
if (!$user) {
    echo json_encode(["success" => false, "error" => "Invalid user"]);
    exit;
}

// Create transaction record
$transactionId = uniqid('txn_');
$transaction = [
    'transaction_id' => $transactionId,
    'amount' => (float)$amount,
    'recipient' => $recipient,
    'description' => $description,
    'email' => $email,
    'status' => 'completed',
    'created_at' => date('c')
];

$result = $db->createDocument('transactions', $transactionId, $transaction);

if ($result['code'] == 200) {
    echo json_encode([
        "success" => true,
        "transaction_id" => $transactionId,
        "amount" => $amount,
        "recipient" => $recipient,
        "message" => "B2B payment completed successfully"
    ]);
} else {
    echo json_encode(["success" => false, "error" => "Failed to record transaction"]);
}
