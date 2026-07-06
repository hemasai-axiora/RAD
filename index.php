<?php
// Redirect to public folder preserving query string
$queryString = $_SERVER['QUERY_STRING'] ?? '';
header('Location: public/index.php' . ($queryString ? '?' . $queryString : ''));
exit();
