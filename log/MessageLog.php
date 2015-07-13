<?php
/**
 * Created by PhpStorm.
 * User: martinmoreno
 * Date: 7/10/15
 * Time: 16:30
 */

namespace log;


class MessageLog extends BaseLog
{
    const PARAM_LOG_MSG = "logMsg";

    protected $logMsg;

    /**
     * @param $logSession
     * @param $msg
     */
    public function __construct($logSession, $msg)
    {
        parent::__construct($logSession);
        $this->logMsg = $msg;
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