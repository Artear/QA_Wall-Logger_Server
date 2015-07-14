<?php
/**
 * Created by PhpStorm.
 * User: martinmoreno
 * Date: 7/10/15
 * Time: 17:43
 */

namespace log;


use utils\ParametersUtil;

class TimeLog extends BaseLog
{
    const PARAM_LOG_MSG = "logMsg";
    const PARAM_TIME_START = "timeStart";
    const PARAM_TIME_END = "timeEnd";

    protected $logMsg;
    protected $timeStart;
    protected $timeEnd;

    /**
     * RequestTimeLog constructor.
     * @param \stdClass $jsonObject
     */
    public function __construct(\stdClass $jsonObject)
    {
        parent::__construct($jsonObject);
        $this->logMsg = ParametersUtil::getPropertyOrThrow(self::PARAM_LOG_MSG, $jsonObject);
        $this->timeStart = ParametersUtil::getPropertyOrThrow(self::PARAM_TIME_START, $jsonObject);
        $this->timeEnd = ParametersUtil::getPropertyOrThrow(self::PARAM_TIME_END, $jsonObject);
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