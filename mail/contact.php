<?php
if(empty($_POST['name']) || empty($_POST['subject']) || empty($_POST['message']) || !filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)) {
  http_response_code(400);
  echo "Please fill in all required fields correctly.";
  exit;
}

$name = strip_tags(trim($_POST['name']));
$email = filter_var(trim($_POST["email"]), FILTER_SANITIZE_EMAIL);
$subject = strip_tags(trim($_POST["subject"]));
$message = trim($_POST["message"]);

// You can customize the email recipient
$recipient = "ghulamhamzabiz@example.com";

// Email content
$email_content = "Name: $name\n";
$email_content .= "Email: $email\n";
$email_content .= "Subject: $subject\n";
$email_content .= "Message:\n$message\n";

// Email headers
$email_headers = "From: $name <$email>";

// Send the email
if (mail($recipient, $subject, $email_content, $email_headers)) {
    http_response_code(200);
    echo "Message sent successfully.";
} else {
    http_response_code(500);
    echo "Something went wrong. Message couldn't be sent.";
}
?>
