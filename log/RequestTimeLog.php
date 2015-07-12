<?php
/**
 * Created by PhpStorm.
 * User: martinmoreno
 * Date: 7/10/15
 * Time: 17:43
 */

namespace log;


class RequestTimeLog extends BaseLog
{
    const PARAM_URL = "url";
    const PARAM_TIME_START = "timeStart";
    const PARAM_TIME_END = "timeEnd";

    protected $url;
    protected $timeStart;
    protected $timeEnd;

    /**
     * RequestTimeLog constructor.
     * @param $logSession
     * @param $url
     * @param $timeStart
     * @param $timeEnd
     */
    public function __construct($logSession, $url, $timeStart, $timeEnd)
    {
        parent::__construct($logSession);
        $this->url = $url;
        $this->timeStart = $timeStart;
        $this->timeEnd = $timeEnd;
    }


}