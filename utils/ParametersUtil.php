<?php
/**
 * Created by PhpStorm.
 * User: martinmoreno
 * Date: 7/10/15
 * Time: 17:34
 */

namespace utils;


use error\ErrorInvalidParam;

abstract class ParametersUtil
{
    public static function getParamOrDie($expectedParam, $sanitizeInt = FILTER_SANITIZE_STRING, $inputStream = INPUT_GET)
    {
        $foundParam = filter_input($inputStream, $expectedParam, $sanitizeInt);

        if (!$foundParam)
        {
            ResponseWriter::writeError(new ErrorInvalidParam($expectedParam));
            die();
        }

        return $foundParam;
    }
}