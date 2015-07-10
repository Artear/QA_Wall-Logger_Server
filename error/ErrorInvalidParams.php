<?php
/**
 * Created by PhpStorm.
 * User: martinmoreno
 * Date: 7/10/15
 * Time: 16:55
 */

namespace error;


use utils\ErrorCode;

class ErrorInvalidParams extends BaseError
{
    /**
     * @var array
     */
    private $acceptedParameters;

    /**
     * ErrorInvalidParams constructor.
     * @param array $acceptedParameters
     */
    public function __construct(array $acceptedParameters = null)
    {
        $this->acceptedParameters = $acceptedParameters;
    }

    function getErrorCode()
    {
        return ErrorCode::INVALID_PARAMETERS;
    }

    function getErrorMsg()
    {
        $acceptedParameters = "";

        if ($this->acceptedParameters)
        {
            $acceptedParameters = "Accepted Parameters are: " . implode(",", $this->acceptedParameters);
        }

        return "Invalid Parameters! " . $acceptedParameters;
    }
}