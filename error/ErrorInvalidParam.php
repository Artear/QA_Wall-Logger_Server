<?php
/**
 * Created by PhpStorm.
 * User: martinmoreno
 * Date: 7/10/15
 * Time: 16:55
 */

namespace error;


class ErrorInvalidParam extends BaseError
{
    private $expectedParam;

    /**
     * ErrorInvalidParams constructor.
     * @param $expectedParam
     */
    public function __construct($expectedParam)
    {
        $this->expectedParam = $expectedParam;
    }

    function getErrorCode()
    {
        return ErrorCode::INVALID_PARAMETERS;
    }

    function getErrorMsg()
    {
        $extraMsg = "";

        if ($this->expectedParam)
        {
            $extraMsg = "Expected param: \"" . $this->expectedParam . "\" not found or poorly formatted.";
        }

        return "Invalid Parameters! " . $extraMsg;
    }
}