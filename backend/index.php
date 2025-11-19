<?php
require_once __DIR__ . "/src/router.php";

$router = new Router();


// ------------------------------------------------
// AUTH ENDPOINTS
// ------------------------------------------------
$router->add("POST", "/api/auth/login", function() {
    require __DIR__ . "/api/auth.php";
});

$router->add("POST", "/api/auth/register", function() {
    require __DIR__ . "/api/register.php";
});

$router->add("GET", "/api/auth/me", function() {
    require __DIR__ . "/api/user.php";
});


// ------------------------------------------------
// TENANTS
// ------------------------------------------------
$router->add("GET", "/api/tenants/{slug}", function($params) {
    $_GET["slug"] = $params["slug"];
    require __DIR__ . "/api/tenant.php";
});

// ------------------------------------------------
// CATEGORIES
// ------------------------------------------------
$router->add("GET", "/api/categories", function() {
    require __DIR__ . "/api/categories.php";
});

$router->add("POST", "/api/categories", function() {
    require __DIR__ . "/api/categories.php";
});

$router->add("PUT", "/api/categories/{id}", function($params) {
    $_GET["id"] = $params["id"];
    require __DIR__ . "/api/categories.php";
});

$router->add("DELETE", "/api/categories/{id}", function($params) {
    $_GET["id"] = $params["id"];
    require __DIR__ . "/api/categories.php";
});


// ------------------------------------------------
// PRODUCTS
// ------------------------------------------------
$router->add("GET", "/api/products", fn() => require __DIR__ . "/api/products.php");
$router->add("POST", "/api/products", fn() => require __DIR__ . "/api/products.php");
$router->add("PUT", "/api/products/{id}", function($params) {
    $_GET["id"] = $params["id"];
    require __DIR__ . "/api/products.php";
});
$router->add("DELETE", "/api/products/{id}", function($params) {
    $_GET["id"] = $params["id"];
    require __DIR__ . "/api/products.php";
});


// ------------------------------------------------
// PRODUCT VARIANTS
// ------------------------------------------------
$router->add("GET", "/api/products/{id}/variants", function($params) {
    $_GET["product_id"] = $params["id"];
    require __DIR__ . "/api/variants.php";
});

$router->add("POST", "/api/products/{id}/variants", function($params) {
    $_GET["product_id"] = $params["id"];
    require __DIR__ . "/api/variants.php";
});

$router->add("PUT", "/api/variants/{id}", function($params) {
    $_GET["variant_id"] = $params["id"];
    require __DIR__ . "/api/variants.php";
});

$router->add("DELETE", "/api/variants/{id}", function($params) {
    $_GET["variant_id"] = $params["id"];
    require __DIR__ . "/api/variants.php";
});


// ------------------------------------------------
// ORDERS
// ------------------------------------------------
$router->add("GET", "/api/orders", fn() => require __DIR__ . "/api/orders.php");
$router->add("POST", "/api/orders", fn() => require __DIR__ . "/api/orders.php");
$router->add("GET", "/api/orders/{id}", function($params) {
    $_GET["id"] = $params["id"];
    require __DIR__ . "/api/orders.php";
});
$router->add("PUT", "/api/orders/{id}/status", function($params) {
    $_GET["id"] = $params["id"];
    require __DIR__ . "/api/orders.php";
});


// ------------------------------------------------
// DISPATCH
// ------------------------------------------------

$router->dispatch($_SERVER["REQUEST_METHOD"], $_SERVER["REQUEST_URI"]);
