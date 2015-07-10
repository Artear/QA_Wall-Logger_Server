<?php
/**
 * Created by PhpStorm.
 * User: martinmoreno
 * Date: 7/10/15
 * Time: 17:08
 */

namespace error;


use utils\ErrorCode;

class ErrorUnknownLogType extends BaseError
{
    protected $logType;
    /**
     * @var array
     */
    private $acceptedTypes;

    /**
     * ErrorUnknownLogType constructor.
     * @param $logType
     * @param array $acceptedTypes
     */
    public function __construct($logType, array $acceptedTypes = null)
    {
        $this->logType = $logType;
        $this->acceptedTypes = $acceptedTypes;
    }


    function getErrorCode()
    {
        return ErrorCode::UNKNOWN_LOG_TYPE;
    }

    function getErrorMsg()
    {
        $acceptedTypes = "";

        if ($this->acceptedTypes)
        {
            $acceptedTypes = "Accepted Parameters are: " . implode(",", $this->acceptedTypes);
        }

        return "Unknown log type: " . $this->logType . " " . $acceptedTypes;
    }
}