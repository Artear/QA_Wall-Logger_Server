<?php
/**
 * Created by PhpStorm.
 * User: martinmoreno
 * Date: 7/10/15
 * Time: 16:30
 */

namespace log;


use utils\ParametersUtil;

class MessageLog extends BaseLog
{
    const PARAM_LOG_MSG = "logMsg";

    protected $logMsg;

    /**
     * @param \stdClass $jsonObject
     */
    public function __construct(\stdClass $jsonObject)
    {
        parent::__construct($jsonObject);

        $this->logMsg = ParametersUtil::getPropertyOrThrow(self::PARAM_LOG_MSG, $jsonObject);
    }


    /**
     * @return boolean flagging if the write succeeded
     */
    protected function onWrite()
    {
        print_r(json_encode(get_object_vars($this)));
        return true;
    }
}