import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { CheckCircle2 } from 'lucide-react'
import { AuthLayout } from '@/features/auth/auth-layout'
import { MerchantRegisterForm } from './components/merchant-register-form'

export function MerchantRegister() {
  const [submitted, setSubmitted] = useState(false)

  return (
    <AuthLayout>
      {submitted ? (
        <div className='space-y-4 text-center'>
          <CheckCircle2 className='mx-auto size-10 text-emerald-600' />
          <div className='space-y-1'>
            <h1 className='text-2xl font-bold tracking-tight'>
              Application submitted
            </h1>
            <p className='text-sm text-muted-foreground'>
              Thanks for applying! We&apos;ll review your application and email
              you once it&apos;s approved.
            </p>
          </div>
          <Link
            to='/sign-in'
            className='inline-block text-sm text-primary underline-offset-4 hover:underline'
          >
            Back to sign in
          </Link>
        </div>
      ) : (
        <>
          <div className='space-y-1'>
            <h1 className='text-2xl font-bold tracking-tight'>
              Apply to become a merchant
            </h1>
            <p className='text-sm text-muted-foreground'>
              Tell us about your restaurant — we&apos;ll be in touch once it&apos;s
              reviewed.
            </p>
          </div>

          <div className='mt-6'>
            <MerchantRegisterForm onSuccess={() => setSubmitted(true)} />
          </div>

          <p className='mt-6 text-center text-xs text-muted-foreground'>
            Already have an account?{' '}
            <Link
              to='/sign-in'
              className='text-primary underline-offset-4 hover:underline'
            >
              Sign in
            </Link>
          </p>
        </>
      )}
    </AuthLayout>
  )
}
