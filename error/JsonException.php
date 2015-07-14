<?php

namespace error;

use Exception;

class JsonException extends Exception
{
    function __construct($message)
    {
        $this->message = $message;
    }
}