<?php

namespace App\Http\Controllers\Api\V1;

use App\Http\Controllers\Controller;
use App\Http\Controllers\Traits\ApiResponse;
use App\Models\User;
use Illuminate\Http\Request;

class UserController extends Controller
{
    use ApiResponse;

    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $users = User::orderBy('name')->get();
        return $this->success($users);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'browser_id' => 'required|string|max:255|unique:users,browser_id',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'browser_id' => $validated['browser_id'],
        ]);

        return $this->created($user);
    }

    /**
     * Display the specified resource.
     */
    public function show(User $user)
    {
        return $this->success($user);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'browser_id' => 'required|string|max:255|unique:users,browser_id,' . $user->id,
        ]);

        $user->name = $validated['name'];
        $user->browser_id = $validated['browser_id'];
        $user->save();

        return $this->success($user, 'Updated');
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(User $user)
    {
        $user->delete();
        return $this->success(null, 'Deleted', 204);
    }
}
