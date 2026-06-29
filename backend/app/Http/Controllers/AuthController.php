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
        $frontendUrl = rtrim((string) config('app.frontend_url'), '/');

        if ($request->filled('error')) {
            $message = (string) ($request->get('error_description') ?: $request->get('error'));

            return redirect("{$frontendUrl}/auth/callback?error=".urlencode($message));
        }

        if (! $request->filled('code')) {
            return redirect("{$frontendUrl}/auth/callback?error=missing_code");
        }

        try {
            $result = $this->service->handleDiscordCallback();

            return redirect("{$frontendUrl}/auth/callback?token={$result['token']}");
        } catch (\Throwable $e) {
            report($e);

            return redirect("{$frontendUrl}/auth/callback?error=oauth_failed");
        }
    }
}
