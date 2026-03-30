// Save as: src/components/StripeProvider.tsx
'use client'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

export default function StripeProvider({ children, clientSecret }: {
  children: React.ReactNode
  clientSecret: string
}) {
  return (
    <Elements
      stripe={stripePromise}
      options={{
        clientSecret,
        appearance: {
          theme: 'stripe',
          variables: {
            colorPrimary:       '#1a1a1a',
            colorBackground:    '#ffffff',
            colorText:          '#1a1a1a',
            colorDanger:        '#c0392b',
            fontFamily:         'var(--font-sans)',
            borderRadius:       '0px',
            fontSizeBase:       '13px',
          },
        },
      }}
    >
      {children}
    </Elements>
  )
}