<?php
/**
 * Created by PhpStorm.
 * User: martinmoreno
 * Date: 7/10/15
 * Time: 16:30
 */

namespace log;


class StringLog extends BaseLog
{
    protected $msg;

    /**
     * StringLog constructor.
     * @param $logSession
     * @param $msg
     */
    public function __construct($logSession, $msg)
    {
        parent::__construct($logSession);
        $this->msg = $msg;
    }
}