## NotifyMe - Push Notification PWA

### Database Setup

1. Go to your Supabase project's SQL editor
2. Copy the contents of `supabase/migrations/20240318_init.sql`
3. Execute the SQL to set up the database schema

### Environment Setup

1. Copy `.env.example` to `.env`:
   ```bash
   cp .env.example .env
   ```

2. Update the `.env` file with your Supabase credentials:
   - `VITE_SUPABASE_URL`: Your Supabase project URL (e.g., https://xxxxxxxxxxxx.supabase.co)
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase project's anon/public key
   - `VITE_VAPID_PUBLIC_KEY`: Your VAPID public key for push notifications

You can find these credentials in your Supabase project settings.

### Features

- User authentication (signup/login)
- Push notification support
- Admin panel for managing users and sending notifications
- Real-time notification delivery
- Progressive Web App (PWA) support
- Responsive design