# Security Procedures for Jere Model Academy Backend

## Dependency Management & Scanning
To ensure that all third-party PHP packages are secure, you should regularly scan the `backend-php` project dependencies using Composer's built-in audit command.

### How to Scan for Vulnerabilities
1. Navigate to the backend directory:
   ```bash
   cd backend-php
   ```
2. Run the audit command:
   ```bash
   composer audit
   ```
   This command checks the installed packages against the packagist security advisories database and will report any known vulnerabilities.

### How to Update Packages
If `composer audit` reports vulnerabilities, you can safely update the dependencies to their latest compatible versions by running:
```bash
composer update
```
If a specific package needs a major version upgrade to resolve a vulnerability, refer to the package's documentation before making manual adjustments to the `composer.json` file.

## Automated Backups
Database backups are fully automated via the custom Artisan command:
```bash
php artisan db:backup
```
This leverages `mysqldump` to generate a timestamped `.sql` file in `storage/app/backups/`. For production environments on Windows, ensure that the path to `mysqldump` is defined in your `.env` file if it is not globally accessible:
```env
MYSQLDUMP_PATH="C:\laragon\bin\mysql\mysql-8.0.30-winx64\bin\mysqldump.exe"
```
It is recommended to run this command via a daily cron job or Windows Task Scheduler.

## API Protection
- **Authentication**: JWT is used for securely transmitting information and authenticating users.
- **Rate Limiting**: Implemented via Laravel's `throttle:60,1` middleware to prevent brute force attacks on API endpoints (max 60 requests per minute per IP).
- **IDOR Protection**: Access control checks ensure users can only modify records they are authorized to manage (RBAC for Admins vs Form Masters).
- **HTTPS**: For production deployments, always enforce HTTPS on the web server (e.g. Nginx, Apache) to encrypt traffic between the React frontend and this Laravel backend.
