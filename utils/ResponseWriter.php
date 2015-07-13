<?php

namespace utils;

use error\BaseException;

class ResponseWriter
{
    static function writeSuccess()
    {
        http_response_code(200);
    }

    static function writeError(BaseException $errorObj)
    {
        ResponseWriter::writeErrorMsg($errorObj->getErrorCode(), $errorObj->getErrorMsg());
    }

    static function writeErrorMsg($errorCode, $errorMsg)
    {
        http_response_code(400);
        $jsonError = new JsonError($errorCode, $errorMsg);
        echo json_encode($jsonError);
    }
}