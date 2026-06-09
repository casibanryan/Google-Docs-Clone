<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\Pivot;
use Illuminate\Database\Eloquent\SoftDeletes;

class ShareDocument extends Pivot
{
   
    use SoftDeletes;

    protected $table = 'document_shares';

    protected $fillable = [
        'document_id',
        'user_id',
    ];

    /*
    |-----------------------------------------
    | Relationships
    |-----------------------------------------
    */

    public function document()
    {
        return $this->belongsTo(Document::class);
    }

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    
}