<?php
/**
 * Created by PhpStorm.
 * User: martinmoreno
 * Date: 7/10/15
 * Time: 15:30
 */

use log\MessageLog;
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

//Get Params
$logSession = ParametersUtil::getParamOrDie(MessageLog::PARAM_LOG_SESSION);
$logMsg = ParametersUtil::getParamOrDie(MessageLog::PARAM_LOG_MSG);

//Write Log
$log = new MessageLog($logSession, $logMsg);
$log->writeLog();

ResponseWriter::writeSuccess();
