<?php

namespace App\Http\Resources;

use App\Http\Resources\UserResource;
use Illuminate\Http\Resources\Json\JsonResource;

class DocumentResource extends JsonResource
{
    public function toArray($request)
    {
        return [
            'id' => $this->id,
            'user_id' => $this->user_id,
            'title' => $this->title,
            'excerpt' => $this->excerpt,
            'content' => $this->content,
            'meta' => $this->meta,
            'is_public' => (bool) $this->is_public,
            'sharedWith' => $this->relationLoaded('sharedUsers') && $this->sharedUsers->isNotEmpty()
                ? UserResource::collection($this->sharedUsers)
                : [],
            'created_at' => optional($this->created_at)->toDateTimeString(),
            'updatedAt' => optional($this->updated_at)->toDateTimeString(),
        ];
    }
}
