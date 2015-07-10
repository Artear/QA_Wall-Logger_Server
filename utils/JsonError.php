<?php

namespace utils;


class JsonError implements \JsonSerializable
{
    private $error_code;
    private $error_msg;

    function __construct($error_code, $error_msg)
    {
        $this->error_code = $error_code;
        $this->error_msg = $error_msg;
    }

    /**
     * (PHP 5 &gt;= 5.4.0)<br/>
     * Specify data which should be serialized to JSON
     * @link http://php.net/manual/en/jsonserializable.jsonserialize.php
     * @return mixed data which can be serialized by <b>json_encode</b>,
     * which is a value of any type other than a resource.
     */
    function jsonSerialize()
    {
        return get_object_vars($this);
    }
}