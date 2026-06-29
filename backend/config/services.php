<?php

declare(strict_types=1);

return [

    'discord' => [
        // Single Discord application used for login (OAuth) and applicant DMs (bot).
        'client_id' => env('DISCORD_CLIENT_ID'),
        'client_secret' => env('DISCORD_CLIENT_SECRET'),
        'redirect' => env(
            'DISCORD_REDIRECT_URI',
            rtrim((string) env('APP_URL', 'http://localhost:8000'), '/').'/api/auth/discord/callback',
        ),
        // Same app as above → Bot → Reset Token
        'bot_token' => env('DISCORD_BOT_TOKEN'),
        // Server ID where the bot lives — users are added on login so DMs can be delivered
        'guild_id' => env('DISCORD_GUILD_ID'),
        'bot_invite_url' => env('DISCORD_CLIENT_ID')
            ? 'https://discord.com/api/oauth2/authorize?client_id='.env('DISCORD_CLIENT_ID').'&scope=bot&permissions=0'
            : null,
        // Comma-separated Discord user IDs — always super admin, survives database resets
        'super_admin_discord_ids' => array_values(array_filter(array_map(
            'trim',
            explode(',', (string) env('ADMIN_DISCORD_IDS', '')),
        ))),
    ],

];
