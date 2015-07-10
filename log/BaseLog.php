<?php
/**
 * Created by PhpStorm.
 * User: martinmoreno
 * Date: 7/10/15
 * Time: 16:23
 */

namespace log;

use utils\ParametersUtil;

abstract class BaseLog
{
    protected $logSession;

    public function __construct()
    {
        $this->logSession = ParametersUtil::getParamOrDie("logSession");
    }

    /**
     * @return object containing the log information to write;
     */
    protected function onWrite()
    {
        return json_encode(get_object_vars($this));
    }

    public final function writeLog()
    {
        print_r($this->onWrite());
    }
}