<?php
/**
 * Created by PhpStorm.
 * User: martinmoreno
 * Date: 7/10/15
 * Time: 15:30
 */

use error\ErrorCode;
use error\InvalidParamException;
use error\JsonException;
use error\WriteException;
use log\TimeLog;
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
    //Get Json
    $inputJSON = file_get_contents('php://input');
    $jsonObject = ParametersUtil::getJsonOrThrow($inputJSON);

    //Write Log
    $log = new TimeLog($jsonObject);
    $log->writeLog();

    ResponseWriter::writeSuccess();

} catch (InvalidParamException $invalidParamsException)
{
    ResponseWriter::writeError($invalidParamsException);
} catch (WriteException $writeException)
{
    ResponseWriter::writeError($writeException);
} catch (JsonException $jsonException)
{
    ResponseWriter::writeErrorMsg(ErrorCode::JSON_ERROR, $jsonException->getMessage());
} catch (Exception $exception)
{
    ResponseWriter::writeErrorMsg(ErrorCode::UNKNOWN, $exception->getMessage());
}