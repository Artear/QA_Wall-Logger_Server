<?php
/**
 * Created by PhpStorm.
 * User: martinmoreno
 * Date: 7/10/15
 * Time: 16:30
 */

namespace log;


use utils\ParametersUtil;

class StringLog extends BaseLog
{
    protected $logMsg;

    public function __construct()
    {
        parent::__construct();
        $this->logMsg = ParametersUtil::getParamOrDie("logMsg");
    }
}