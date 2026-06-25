import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/lib/stripe'
import { createClient } from '@/lib/supabase/server'
import { ServiceType, SERVICE_LABELS, SERVICE_PRICES } from '@/lib/types'

export async function POST(request: NextRequest) {
  try {
    const { orderId, serviceType }: { orderId: string; serviceType: ServiceType } = await request.json()

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorised' }, { status: 401 })
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `ECU Unlock — ${SERVICE_LABELS[serviceType]}`,
              description: 'P1 Engineering ECU unlock service',
            },
            unit_amount: SERVICE_PRICES[serviceType],
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/orders/${orderId}?payment=success`,
      cancel_url: `${appUrl}/submit`,
      metadata: {
        order_id: orderId,
        user_id: user.id,
      },
      customer_email: user.email,
    })

    return NextResponse.json({ url: session.url })
  } catch (err: any) {
    console.error('Stripe checkout error:', err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
