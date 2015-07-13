<?php
/**
 * Created by PhpStorm.
 * User: martinmoreno
 * Date: 7/10/15
 * Time: 15:30
 */

use error\InvalidParamException;
use error\WriteException;
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

try
{
    //Get Params
    $logSession = ParametersUtil::getParamOrThrow(MessageLog::PARAM_LOG_SESSION);
    $logMsg = ParametersUtil::getParamOrThrow(MessageLog::PARAM_LOG_MSG);

    //Write Log
    $log = new MessageLog($logSession, $logMsg);
    $log->writeLog();
    ResponseWriter::writeSuccess();

} catch (InvalidParamException $invalidParamsException)
{
    ResponseWriter::writeError($invalidParamsException);
} catch (WriteException $writeException)
{
    ResponseWriter::writeError($writeException);
}
