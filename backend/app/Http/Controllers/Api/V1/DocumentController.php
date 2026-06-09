<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\ApiResponse;
use App\Http\Requests\StoreDocumentRequest;
use App\Http\Requests\UpdateDocumentRequest;
use App\Http\Resources\DocumentResource;
use App\Models\Document;
use Illuminate\Http\Request;

class DocumentController extends Controller
{
    use ApiResponse;

    public function index(Request $request)
    {
        $query = Document::query();
        if ($q = $request->query('q')) {
            $query->where('title', 'like', "%{$q}%");
        }

        $documents = $query->with('sharedUsers')->latest()->paginate(15);
        return $this->success(DocumentResource::collection($documents));
    }

    public function store(StoreDocumentRequest $request)
    {
        $data = $request->validated();
        // user_id is already in validated data from the request
        $document = Document::create($data);

        return $this->created(new DocumentResource($document));
    }

    public function show(Document $document)
    {
        return $this->success(new DocumentResource($document));
    }

    public function update(UpdateDocumentRequest $request, Document $document)
    {
        $data = $request->validated();
        $document->update($data);

        return $this->success(new DocumentResource($document));
    }

    public function destroy(Document $document)
    {
        $document->delete();
        return $this->success(null, 'Deleted', 204);
    }
}
