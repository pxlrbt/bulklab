<?php

session_start();

require __DIR__ . '/config.php';

// Redirect for auth
if (isset($_POST['gitlabHost'])) {
    $gitlabHost = trim($_POST['gitlabHost'], '/ ');
    $state = "BulkLab_" . bin2hex(random_bytes(8));

    $_SESSION['state'] = $state;
    $_SESSION['gitlabHost'] = $gitlabHost;

    if (empty($gitlabHost)) {
        echo "No GitLab host provided.";
        return;
    }

    $url = $gitlabHost . "/oauth/authorize?client_id=" . $appId . "&redirect_uri=" . $redirectUrl . "&response_type=code&state=" . $state;

    header("Location: " . $url);
    return;
}

// Get auth token
if (isset($_GET['code'])) {
    if ($_GET['state'] != $_SESSION['state']) {
        echo 'ERROR: State does not match session.';
        exit;
    }

    $gitlabHost = $_SESSION['gitlabHost'];
    $params = [
        "client_id" => $appId,
        "client_secret" => $appSecret,
        "code" => $_GET['code'],
        "grant_type" => "authorization_code",
        "redirect_uri" => $redirectUrl
    ];

    $out = fopen('php://output', 'w');

    $url = $gitlabHost . "/oauth/token";
    $ch = curl_init();

    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $params);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, 0);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, 0);
    curl_setopt($ch, CURLOPT_VERBOSE, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

    $response = curl_exec($ch);

    if (strlen($response) == 0) {
        echo "Invalid response: " . curl_error($ch);
        return;
    }


    $data = json_decode($response);

    if (isset($data->error)) {
        echo "An error occured: " . $data->error_description;
        return;
    }

    setcookie("GITLAB_ACCESS_TOKEN", $data->access_token);
    setcookie("GITLAB_HOST", $_SESSION['gitlabHost']);
    header("Location: /");
    return;
}
