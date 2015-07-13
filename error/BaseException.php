<?php
/**
 * Created by PhpStorm.
 * User: martinmoreno
 * Date: 7/10/15
 * Time: 16:53
 */

namespace error;


abstract class BaseException extends \Exception
{
    public abstract function getErrorCode();

    public abstract function getErrorMsg();
}