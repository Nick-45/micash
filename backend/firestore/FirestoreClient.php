<?php
class FirestoreClient {
    private $accessToken;
    
    public function __construct($accessToken) {
        $this->accessToken = $accessToken;
    }
    
    private function request($method, $path, $data = null) {
        $url = FIRESTORE_API_URL . $path;
        $headers = [
            "Authorization: Bearer " . $this->accessToken,
            "Content-Type: application/json"
        ];
        
        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        
        if ($data) {
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        }
        
        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        curl_close($ch);
        
        return ["code" => $httpCode, "data" => json_decode($response, true)];
    }
    
    public function createDocument($collection, $documentId, $data) {
        return $this->request("POST", "/" . $collection . "?documentId=" . $documentId, ["fields" => $this->encodeFields($data)]);
    }
    
    public function getDocument($collection, $documentId) {
        $result = $this->request("GET", "/" . $collection . "/" . $documentId);
        if ($result["code"] == 200 && isset($result["data"]["fields"])) {
            return $this->decodeFields($result["data"]["fields"]);
        }
        return null;
    }
    
    private function encodeFields($data) {
        $fields = [];
        foreach ($data as $key => $value) {
            if (is_string($value)) {
                $fields[$key] = ["stringValue" => $value];
            } elseif (is_int($value)) {
                $fields[$key] = ["integerValue" => $value];
            } elseif (is_float($value)) {
                $fields[$key] = ["doubleValue" => $value];
            } elseif (is_bool($value)) {
                $fields[$key] = ["booleanValue" => $value];
            } else {
                $fields[$key] = ["stringValue" => json_encode($value)];
            }
        }
        return $fields;
    }
    
    private function decodeFields($fields) {
        $data = [];
        foreach ($fields as $key => $value) {
            if (isset($value["stringValue"])) {
                $data[$key] = $value["stringValue"];
            } elseif (isset($value["integerValue"])) {
                $data[$key] = (int)$value["integerValue"];
            } elseif (isset($value["doubleValue"])) {
                $data[$key] = (float)$value["doubleValue"];
            } elseif (isset($value["booleanValue"])) {
                $data[$key] = (bool)$value["booleanValue"];
            }
        }
        return $data;
    }
}
