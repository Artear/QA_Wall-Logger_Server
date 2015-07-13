<?php
/**
 * Created by PhpStorm.
 * User: martinmoreno
 * Date: 7/10/15
 * Time: 15:30
 */

use error\ErrorCode;
use error\InvalidParamException;
use error\WriteException;
use log\RequestTimeLog;
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
    $logSession = ParametersUtil::getParamOrThrow(RequestTimeLog::PARAM_LOG_SESSION);
    $url = ParametersUtil::getParamOrThrow(RequestTimeLog::PARAM_URL);
    $timeStart = ParametersUtil::getParamOrThrow(RequestTimeLog::PARAM_TIME_START, FILTER_SANITIZE_NUMBER_INT);
    $timeEnd = ParametersUtil::getParamOrThrow(RequestTimeLog::PARAM_TIME_END, FILTER_SANITIZE_NUMBER_INT);


    //Write Log
    $log = new RequestTimeLog($logSession, $url, $timeStart, $timeEnd);
    $log->writeLog();

    ResponseWriter::writeSuccess();

} catch (InvalidParamException $invalidParamsException)
{
    ResponseWriter::writeError($invalidParamsException);
} catch (WriteException $writeException)
{
    ResponseWriter::writeError($writeException);
} catch (Exception $exception)
{
    ResponseWriter::writeErrorMsg(ErrorCode::UNKNOWN, $exception->getMessage());
}