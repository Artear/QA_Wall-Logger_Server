<?php
/**
 * Created by PhpStorm.
 * User: martinmoreno
 * Date: 7/10/15
 * Time: 16:23
 */

namespace log;

use error\WriteException;

abstract class BaseLog
{
    const PARAM_LOG_SESSION = "logSession";

    protected $logSession;

    public function __construct($logSession)
    {
        $this->logSession = $logSession;
    }

    /**
     * @return boolean flagging if the write succeeded
     */
    protected abstract function onWrite();

    public final function writeLog()
    {
        if (!$this->onWrite())
        {
            throw new WriteException("Can't write object: " . json_encode(get_object_vars($this)));
        }
    }
}