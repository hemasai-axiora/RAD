<?php
// Sample environment configuration reference for Raptor CRM.
// Copy these into your server environment (Apache SetEnv, systemd, .env loader,
// or the shell). config.php reads them via env() with local-dev fallbacks.
//
// Database
//   DB_HOST=127.0.0.1
//   DB_USER=raptor
//   DB_PASS=change-me-strong-password
//   DB_NAME=raptor_crm_db
//
// App
//   URLROOT=https://sales.yourdomain.com/public
//   SITENAME=Raptor Sales Monitoring
//   APP_ENV=production            # production | development
//   SESSION_TIMEOUT=1800          # seconds
//
// Storage (private dir OUTSIDE web root)
//   STORAGE_PATH=/var/raptor/storage
//   MAX_UPLOAD_BYTES=5242880      # 5 MB
//
// This file is a reference only and is not loaded by the application.
