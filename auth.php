<?php

$gitlabUrl = "https://gitlab.com/";
$redirectUrl = "https://gitlab-bulk.pxlrbt.test/auth.php";
$appId = "e2bf0e0eea2bdf7c281ab940865bc32197a684e96733bc82dc8f78760ee1fedd";
$appSecret = "58e63b9fba2fa8cc07e1043e21c0fa3d186c1237b4d6adefddebc36a58467033";
$state = "PXLRBT_GITLAB_BULK";

if (isset($_GET['code'])) {
    $params = [
        "client_id" => $appId,
        "client_secret" => $appSecret,
        "code" => $_GET['code'],
        "grant_type" => "authorization_code",
        "redirect_uri" => $redirectUrl
    ];

    $out = fopen('php://output', 'w');

    $url = $gitlabUrl . "oauth/token";
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
    header("Location: /");
    return;
}



$url = $gitlabUrl . "oauth/authorize?client_id=" . $appId . "&redirect_uri=" . $redirectUrl . "&response_type=code&state=" . $state;
header("Location: " . $url);
return;