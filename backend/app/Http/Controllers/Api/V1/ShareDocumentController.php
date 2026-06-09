<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\ApiResponse;
use App\Models\ShareDocument;
use Illuminate\Http\Request;

class ShareDocumentController extends Controller
{
    use ApiResponse;

    public function store(Request $request)
    {

        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'document_id' => 'required|exists:documents,id'
        ]);

        $share = ShareDocument::updateOrCreate($validated);

        return $this->success($share, 'Share created');
    }

    public function destroy(Request $request)
    {
        $validated = $request->validate([
            'user_id' => 'required|exists:users,id',
            'document_id' => 'required|exists:documents,id'
        ]);

        $shareDoc = ShareDocument::where($validated)->first();
        $shareDoc->delete();
       return $this->success(null, 'Deleted', 204);
    }
}