<?php
/**
 * Created by PhpStorm.
 * User: martinmoreno
 * Date: 7/13/15
 * Time: 11:33
 */

namespace error;


class WriteException extends BaseException
{
    private $objectDescription;

    function __construct($objectDescription)
    {
        $this->objectDescription = $objectDescription;
    }

    function getErrorCode()
    {
        return ErrorCode::WRITE_ERROR;
    }

    function getErrorMsg()
    {
        return "Can't write object: " . $this->objectDescription;
    }


}