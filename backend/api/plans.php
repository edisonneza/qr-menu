<?php
// backend/api/plans.php
declare(strict_types=1);
require_once __DIR__ . '/../src/bootstrap.php';
require_once __DIR__ . '/../src/helpers.php';

use App\Services\DB;
use App\Services\PlanService;

$pdo = App\Services\DB::getPDO($config);
$planSvc = new PlanService($pdo);
$plans = $planSvc->listPlans();
jsonSend(['success'=>true,'data'=>$plans]);
