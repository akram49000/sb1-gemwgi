import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import webpush from 'npm:web-push'

const VAPID_PUBLIC_KEY = Deno.env.get('VAPID_PUBLIC_KEY')
const VAPID_PRIVATE_KEY = Deno.env.get('VAPID_PRIVATE_KEY')
const VAPID_SUBJECT = 'mailto:contact@unionalgerienne.fr'

webpush.setVapidDetails(
  VAPID_SUBJECT,
  VAPID_PUBLIC_KEY!,
  VAPID_PRIVATE_KEY!
)

serve(async (req) => {
  try {
    const { notification, subscription } = await req.json()

    await webpush.sendNotification(
      subscription,
      JSON.stringify({
        title: notification.title,
        message: notification.message,
        id: notification.id
      })
    )

    return new Response(
      JSON.stringify({ message: 'Push notification sent' }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { 'Content-Type': 'application/json' },
        status: 500,
      },
    )
  }
})