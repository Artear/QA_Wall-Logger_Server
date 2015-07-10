<?php
/**
 * Created by PhpStorm.
 * User: martinmoreno
 * Date: 7/10/15
 * Time: 16:53
 */

namespace error;


abstract class BaseError
{
    abstract function getErrorCode();

    abstract function getErrorMsg();
}