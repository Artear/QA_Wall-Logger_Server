<?php

namespace utils;

use error\BaseError;

class ResponseWriter
{
    static function writeSuccess()
    {
        http_response_code(200);
    }

    static function writeError(BaseError $errorObj)
    {
        http_response_code(400);
        $jsonError = new JsonError($errorObj->getErrorCode(), $errorObj->getErrorMsg());
        echo json_encode($jsonError);
    }
}