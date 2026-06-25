import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createAdminClient } from '@/lib/supabase/server'
import Stripe from 'stripe'

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get('stripe-signature')!

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err: any) {
    console.error('Webhook signature verification failed:', err.message)
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  const supabase = createAdminClient()

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session
    const orderId = session.metadata?.order_id

    if (!orderId) {
      return NextResponse.json({ error: 'Missing order_id in metadata' }, { status: 400 })
    }

    // Update order: mark as paid and queued
    const { error } = await supabase
      .from('orders')
      .update({
        stripe_payment_status: 'paid',
        stripe_payment_intent_id: session.payment_intent as string,
        status: 'queued',
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId)

    if (error) {
      console.error('Failed to update order:', error)
      return NextResponse.json({ error: 'DB update failed' }, { status: 500 })
    }

    // Insert timeline event
    await supabase.from('order_events').insert({
      order_id: orderId,
      event_type: 'status_change',
      description: 'Payment confirmed — order queued for processing',
      created_by: 'system',
    })

    // Send notification email to admin (optional — implement with Resend)
    // await sendAdminNotification(orderId)
  }

  return NextResponse.json({ received: true })
}

// Tell Next.js not to parse the body (Stripe needs the raw body for signature verification)
export const config = {
  api: { bodyParser: false },
}
