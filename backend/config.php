<?php
header("Content-Type: application/json");
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    exit(0);
}

// Firebase Firestore config (using Google Cloud Firestore REST API)
define('FIRESTORE_PROJECT_ID', 'your-firebase-project-id');
define('FIRESTORE_API_URL', 'https://firestore.googleapis.com/v1/projects/' . FIRESTORE_PROJECT_ID . '/databases/(default)/documents');
