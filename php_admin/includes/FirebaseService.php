<?php
/**
 * Firebase Realtime Database & Cloud Messaging Service for PHP
 * كلاس الاتصال المتكامل بقاعدة بيانات وإشعارات Firebase
 */

require_once __DIR__ . '/../config/config.php';

class FirebaseService
{
    private $dbUrl;
    private $secret;
    private $serviceAccountPath;
    private $projectId;
    private $accessToken = null;
    private $tokenExpiry = 0;

    public function __construct()
    {
        $this->dbUrl = rtrim(FIREBASE_DB_URL, '/');
        $this->secret = defined('FIREBASE_DB_SECRET') ? FIREBASE_DB_SECRET : '';
        $this->serviceAccountPath = defined('FIREBASE_SERVICE_ACCOUNT_PATH') ? FIREBASE_SERVICE_ACCOUNT_PATH : '';
        $this->projectId = defined('FIREBASE_PROJECT_ID') ? FIREBASE_PROJECT_ID : '';
    }

    /**
     * بناء الرابط الكامل للطلب إلى Realtime Database
     */
    private function buildUrl($path, $params = [])
    {
        $cleanPath = ltrim($path, '/');
        $url = $this->dbUrl . '/' . $cleanPath . '.json';

        if (!empty($this->secret)) {
            $params['auth'] = $this->secret;
        }

        if (!empty($params)) {
            $url .= '?' . http_build_query($params);
        }

        return $url;
    }

    /**
     * تنفيذ طلب cURL
     */
    private function executeRequest($url, $method = 'GET', $data = null)
    {
        $ch = curl_init();

        curl_setopt($ch, CURLOPT_URL, $url);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_CUSTOMREQUEST, $method);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_TIMEOUT, 30);

        $headers = [
            'Content-Type: application/json',
            'Accept: application/json'
        ];

        // في حال استخدام Google Access Token
        $token = $this->getAccessToken();
        if ($token && empty($this->secret)) {
            $headers[] = 'Authorization: Bearer ' . $token;
        }

        curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);

        if ($data !== null && in_array($method, ['POST', 'PUT', 'PATCH'])) {
            $payload = is_string($data) ? $data : json_encode($data, JSON_UNESCAPED_UNICODE);
            curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        }

        $response = curl_exec($ch);
        $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
        $curlError = curl_error($ch);
        curl_close($ch);

        if ($curlError) {
            return [
                'success' => false,
                'error' => 'cURL Error: ' . $curlError,
                'code' => $httpCode
            ];
        }

        $decoded = json_decode($response, true);
        $success = ($httpCode >= 200 && $httpCode < 300);

        return [
            'success' => $success,
            'code' => $httpCode,
            'data' => $decoded,
            'raw' => $response
        ];
    }

    /**
     * جلب البيانات (GET)
     */
    public function get($path, $params = [])
    {
        $url = $this->buildUrl($path, $params);
        $res = $this->executeRequest($url, 'GET');
        return $res['success'] ? $res['data'] : null;
    }

    /**
     * إنشاء عنصر جديد بمعرف عشوائي (POST / Push)
     */
    public function push($path, $data)
    {
        $url = $this->buildUrl($path);
        $res = $this->executeRequest($url, 'POST', $data);
        return $res['success'] ? $res['data'] : false; // returns ['name' => '-Nxxxx...']
    }

    /**
     * حفظ أو استبدال كامل المسار (PUT / Set)
     */
    public function set($path, $data)
    {
        $url = $this->buildUrl($path);
        $res = $this->executeRequest($url, 'PUT', $data);
        return $res['success'];
    }

    /**
     * تحديث حقول معينة دون مسح الباقي (PATCH / Update)
     */
    public function update($path, $data)
    {
        $url = $this->buildUrl($path);
        $res = $this->executeRequest($url, 'PATCH', $data);
        return $res['success'];
    }

    /**
     * حذف مسار معين (DELETE)
     */
    public function delete($path)
    {
        $url = $this->buildUrl($path);
        $res = $this->executeRequest($url, 'DELETE');
        return $res['success'];
    }

    /**
     * توليد OAuth2 Access Token من ملف Service Account JSON (FCM v1 / DB)
     */
    public function getAccessToken()
    {
        if ($this->accessToken && time() < $this->tokenExpiry - 60) {
            return $this->accessToken;
        }

        if (!file_exists($this->serviceAccountPath)) {
            return null;
        }

        $serviceAccount = json_decode(file_get_contents($this->serviceAccountPath), true);
        if (!$serviceAccount || empty($serviceAccount['private_key']) || empty($serviceAccount['client_email'])) {
            return null;
        }

        $header = ['alg' => 'RS256', 'typ' => 'JWT'];
        $now = time();
        $claim = [
            'iss' => $serviceAccount['client_email'],
            'scope' => 'https://www.googleapis.com/auth/firebase.database https://www.googleapis.com/auth/firebase.messaging',
            'aud' => 'https://oauth2.googleapis.com/token',
            'exp' => $now + 3600,
            'iat' => $now
        ];

        $base64UrlHeader = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(json_encode($header)));
        $base64UrlClaim = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode(json_encode($claim)));

        $signature = '';
        openssl_sign($base64UrlHeader . '.' . $base64UrlClaim, $signature, $serviceAccount['private_key'], OPENSSL_ALGO_SHA256);
        $base64UrlSignature = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($signature));

        $jwt = $base64UrlHeader . '.' . $base64UrlClaim . '.' . $base64UrlSignature;

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, 'https://oauth2.googleapis.com/token');
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
            'grant_type' => 'urn:ietf:params:oauth:grant-type:jwt-bearer',
            'assertion' => $jwt
        ]));

        $resp = curl_exec($ch);
        curl_close($ch);

        $json = json_decode($resp, true);
        if (!empty($json['access_token'])) {
            $this->accessToken = $json['access_token'];
            $this->tokenExpiry = $now + ($json['expires_in'] ?? 3600);
            return $this->accessToken;
        }

        return null;
    }

    /**
     * إرسال إشعار فوري لجميع الطلاب أو جهاز محدد (FCM v1 أو Legacy)
     */
    public function sendPushNotification($title, $body, $targetTopic = 'all', $customData = [])
    {
        $token = $this->getAccessToken();

        // طريقة FCM HTTP v1 (الحديثة والمعتمدة رسمياً)
        if ($token && !empty($this->projectId)) {
            $url = "https://fcm.googleapis.com/v1/projects/{$this->projectId}/messages:send";
            $message = [
                'message' => [
                    'topic' => $targetTopic,
                    'notification' => [
                        'title' => $title,
                        'body' => $body
                    ],
                    'data' => array_map('strval', $customData)
                ]
            ];

            $ch = curl_init($url);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: Bearer ' . $token,
                'Content-Type: application/json'
            ]);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($message));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            $res = curl_exec($ch);
            $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            return ['success' => ($code == 200), 'response' => json_decode($res, true)];
        }

        // طريقة Legacy Server Key إن كان معرفاً
        if (defined('FCM_SERVER_KEY') && !empty(FCM_SERVER_KEY)) {
            $url = 'https://fcm.googleapis.com/fcm/send';
            $fields = [
                'to' => '/topics/' . $targetTopic,
                'notification' => [
                    'title' => $title,
                    'body' => $body,
                    'sound' => 'default'
                ],
                'data' => $customData
            ];

            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $url);
            curl_setopt($ch, CURLOPT_POST, true);
            curl_setopt($ch, CURLOPT_HTTPHEADER, [
                'Authorization: key=' . FCM_SERVER_KEY,
                'Content-Type: application/json'
            ]);
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
            curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
            curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($fields));
            $res = curl_exec($ch);
            $code = curl_getinfo($ch, CURLINFO_HTTP_CODE);
            curl_close($ch);

            return ['success' => ($code == 200), 'response' => json_decode($res, true)];
        }

        return ['success' => false, 'error' => 'لا يتوفر مفتاح خادم FCM أو ملف Service Account.'];
    }
}
