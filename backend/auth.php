<?php
require_once 'config.php';
require_once 'firestore/FirestoreClient.php';

$input = json_decode(file_get_contents("php://input"), true);
$action = $input['action'] ?? '';
$accessToken = $input['access_token'] ?? '';
$email = $input['email'] ?? '';
$password = $input['password'] ?? ''; // In production, hash this

if (empty($accessToken)) {
    echo json_encode(["success" => false, "error" => "Access token required"]);
    exit;
}

$db = new FirestoreClient($accessToken);

if ($action === 'signup') {
    // Check if user exists
    $existing = $db->getDocument('users', $email);
    if ($existing) {
        echo json_encode(["success" => false, "error" => "User already exists"]);
        exit;
    }
    
    $result = $db->createDocument('users', $email, [
        'email' => $email,
        'password' => password_hash($password, PASSWORD_DEFAULT),
        'access_token' => $accessToken,
        'created_at' => date('c')
    ]);
    
    if ($result['code'] == 200) {
        echo json_encode(["success" => true, "message" => "User created successfully"]);
    } else {
        echo json_encode(["success" => false, "error" => "Firestore error: " . json_encode($result)]);
    }
    
} elseif ($action === 'login') {
    $user = $db->getDocument('users', $email);
    if ($user && password_verify($password, $user['password'])) {
        echo json_encode(["success" => true, "access_token" => $user['access_token'], "email" => $email]);
    } else {
        echo json_encode(["success" => false, "error" => "Invalid credentials"]);
    }
} else {
    echo json_encode(["success" => false, "error" => "Invalid action"]);
}
