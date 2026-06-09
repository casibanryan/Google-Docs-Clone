<?php

namespace App\Http\Controllers\Traits;

trait ApiResponse
{
    protected function success($data = null, $message = 'OK', $status = 200)
    {
        return response()->json(['success' => true, 'message' => $message, 'data' => $data], $status);
    }

    protected function created($data = null, $message = 'Created')
    {
        return $this->success($data, $message, 201);
    }

    protected function error($message = 'Error', $status = 500, $errors = null)
    {
        $payload = ['success' => false, 'message' => $message];
        if ($errors) $payload['errors'] = $errors;
        return response()->json($payload, $status);
    }
}
