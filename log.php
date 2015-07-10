<?php
/**
 * Created by PhpStorm.
 * User: martinmoreno
 * Date: 7/10/15
 * Time: 15:30
 */


use error\ErrorUnknownLogType;
use log\LogType;
use log\RequestTimeLog;
use log\StringLog;
use utils\ParametersUtil;
use utils\ResponseWriter;

spl_autoload_register(function ($className)
{

    $className = ltrim($className, "\\");
    $fileName = "";

    if ($lastNsPos = strripos($className, "\\"))
    {
        $namespace = substr($className, 0, $lastNsPos);
        $className = substr($className, $lastNsPos + 1);
        $fileName = str_replace("\\", DIRECTORY_SEPARATOR, $namespace) . DIRECTORY_SEPARATOR;
    }
    $fileName .= str_replace("_", DIRECTORY_SEPARATOR, $className) . ".php";

    require $fileName;
});

$logType = ParametersUtil::getParamOrDie('logType');

$log = null;

switch ($logType)
{
    case LogType::TEXT:
        $log = new StringLog();
        break;

    case LogType::REQUEST_TIME:
        $log = new RequestTimeLog();
        break;

    default:
        ResponseWriter::writeError(new ErrorUnknownLogType($logType));
        break;
}

if ($log)
{
    $log->writeLog();
}

