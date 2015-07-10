<?php
/**
 * Created by PhpStorm.
 * User: martinmoreno
 * Date: 7/10/15
 * Time: 17:43
 */

namespace log;


use utils\ParametersUtil;

class RequestTimeLog extends BaseLog
{
    protected $logUrl;
    protected $durationMilliseconds;

    /**
     * RequestTimeLog constructor.
     */
    public function __construct()
    {
        parent::__construct();
        $this->logUrl = ParametersUtil::getParamOrDie("logUrl", FILTER_SANITIZE_URL);
        $this->durationMilliseconds = ParametersUtil::getParamOrDie("durationMilliseconds", FILTER_SANITIZE_NUMBER_INT);
    }
}