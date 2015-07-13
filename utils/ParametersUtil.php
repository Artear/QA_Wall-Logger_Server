<?php
/**
 * Created by PhpStorm.
 * User: martinmoreno
 * Date: 7/10/15
 * Time: 17:34
 */

namespace utils;


use error\InvalidParamException;

abstract class ParametersUtil
{
    public static function getParamOrThrow($expectedParam, $sanitizeInt = FILTER_SANITIZE_STRING, $inputStream = INPUT_GET)
    {
        $foundParam = filter_input($inputStream, $expectedParam, $sanitizeInt);

        if (!$foundParam)
        {
            throw new InvalidParamException($expectedParam);
        }

        return $foundParam;
    }
}