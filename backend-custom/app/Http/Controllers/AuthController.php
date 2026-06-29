<?php

declare(strict_types=1);

namespace App\Http\Controllers;

use App\Services\AuthService;
use Illuminate\Http\Request;

class AuthController extends Controller
{
    public function __construct(protected AuthService $service)
    {
    }

    public function redirect()
    {
        return $this->service->redirectToDiscord();
    }

    public function callback(Request $request)
    {
        $result = $this->service->handleDiscordCallback();
        $frontendUrl = rtrim((string) config('app.frontend_url'), '/');

        return redirect("{$frontendUrl}/auth/callback?token={$result['token']}");
    }
}
