<?php
// core/Router.php

class Router
{
    private array $routes = [];

    public function add(string $method, string $pattern, callable $callback)
    {
        $this->routes[] = [$method, $pattern, $callback];
    }

    public function dispatch(string $method, string $uri)
    {
        $uri = parse_url($uri, PHP_URL_PATH);

        // ⭐ Remove directory prefix like /github/qr-menu/backend
        $base = dirname($_SERVER['SCRIPT_NAME']); // "/github/qr-menu/backend"
        if ($base !== "/" && str_starts_with($uri, $base)) {
            $uri = substr($uri, strlen($base));
        }

        // Normalize empty uri → "/"
        if ($uri === "" || $uri === false) {
            $uri = "/";
        }

        foreach ($this->routes as [$routeMethod, $pattern, $callback]) {
            $regex = "#^" . preg_replace('#\{(\w+)\}#', '(?P<\1>[^/]+)', $pattern) . "$#";

            if ($method === $routeMethod && preg_match($regex, $uri, $matches)) {
                $params = array_filter($matches, "is_string", ARRAY_FILTER_USE_KEY);
                return call_user_func($callback, $params);
            }
        }

        http_response_code(404);
        echo json_encode(["error" => "Endpoint not found"]);
    }
}
