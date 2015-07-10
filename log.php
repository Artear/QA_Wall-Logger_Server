<?php
/**
 * Created by PhpStorm.
 * User: martinmoreno
 * Date: 7/10/15
 * Time: 15:30
 */


use error\ErrorInvalidParams;
use error\ErrorUnknownLogType;
use log\LogType;
use log\StringLog;
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

$acceptedParams = array('logSession', 'logType', 'logMsg');

$logSession = filter_input(INPUT_GET, $acceptedParams[0], FILTER_SANITIZE_STRING);
$logType = filter_input(INPUT_GET, $acceptedParams[1], FILTER_SANITIZE_STRING);
$logMsg = filter_input(INPUT_GET, $acceptedParams[2], FILTER_SANITIZE_STRING);

if (!$logSession || !$logType || !$logMsg)
{
    ResponseWriter::writeError(new ErrorInvalidParams($acceptedParams));
    die();
}


switch ($logType)
{
    case LogType::TEXT:
        $msg = filter_input(INPUT_GET, 'msg', FILTER_SANITIZE_STRING);
        $log = new StringLog($logSession, $logMsg);
        $log->writeLog();
        break;

    default:
        ResponseWriter::writeError(new ErrorUnknownLogType($logType));
        break;
}


