<?php
/**
 * Created by PhpStorm.
 * User: martinmoreno
 * Date: 4/10/15
 * Time: 12:59
 */

namespace error;


abstract class ErrorCode
{
    const UNKNOWN = 0;
    const INVALID_PARAMETERS = 1;
    const WRITE_ERROR = 2;
    const JSON_ERROR = 3;
}