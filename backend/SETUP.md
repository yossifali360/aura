# Aura RP Backend Setup (Windows + XAMPP)

Run this in PowerShell from `D:\aura\backend`:

```powershell
# 1. Add PHP & Composer to PATH for this session
$env:Path = "C:\xampp\php;C:\ProgramData\ComposerSetup\bin;" + $env:Path

# 2. Install dependencies (Composer may block insecure packages — run line 3 if this fails)
composer install

# If step 2 fails with "security advisories", run:
# composer config audit.block-insecure false
# composer install

# If install fails downloading from GitHub (HTTP 400 on codeload.github.com):
composer clear-cache
composer install

# If it still fails on laravel/tinker, install from git instead:
composer install --prefer-source
# (requires Git installed; slower but reliable)

# 3. Environment
copy .env.example .env
# Edit .env → add DISCORD_CLIENT_ID and DISCORD_CLIENT_SECRET

# 4. Laravel setup
php artisan key:generate
New-Item -ItemType File -Path database\database.sqlite -Force
php artisan migrate

# 5. Start API
php artisan serve
```

## Why "Could not open input file: artisan" happened

The old `backend/` folder was **custom code only** — no full Laravel app.  
It now has `artisan`, but you still need `composer install` to create the `vendor/` folder before artisan commands work.

## Enable PHP zip (already done if using XAMPP)

In `C:\xampp\php\php.ini`, ensure this line is uncommented:
```
extension=zip
```
