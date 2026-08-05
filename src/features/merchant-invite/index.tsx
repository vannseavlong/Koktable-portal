import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { getRouteApi, Link } from '@tanstack/react-router'
import { CheckCircle2, Loader2 } from 'lucide-react'
import { ApiError } from '@/lib/api-client'
import { AuthLayout } from '@/features/auth/auth-layout'
import { MerchantInviteForm } from './components/merchant-invite-form'
import { getMerchantInvite } from './data/merchant-invite-api'

const route = getRouteApi('/(auth)/invite/$token')

function BackToSignIn() {
  return (
    <Link
      to='/sign-in'
      className='inline-block text-sm text-primary underline-offset-4 hover:underline'
    >
      Back to sign in
    </Link>
  )
}

export function MerchantInviteAccept() {
  const { token } = route.useParams()
  const [accepted, setAccepted] = useState(false)

  const { data, isLoading, error } = useQuery({
    queryKey: ['merchant-invite', token],
    queryFn: () => getMerchantInvite(token),
    enabled: !accepted,
    retry: false,
  })

  if (accepted) {
    return (
      <AuthLayout>
        <div className='space-y-4 text-center'>
          <CheckCircle2 className='mx-auto size-10 text-emerald-600' />
          <div className='space-y-1'>
            <h1 className='text-2xl font-bold tracking-tight'>
              You&apos;re all set{data ? `, ${data.restaurant.name}` : ''}!
            </h1>
            <p className='text-sm text-muted-foreground'>
              Your account is ready. We&apos;ll email you when the merchant
              dashboard is available.
            </p>
          </div>
          <BackToSignIn />
        </div>
      </AuthLayout>
    )
  }

  if (isLoading) {
    return (
      <AuthLayout>
        <div className='flex justify-center py-10'>
          <Loader2 className='size-8 animate-spin text-muted-foreground' />
        </div>
      </AuthLayout>
    )
  }

  if (error) {
    const status = error instanceof ApiError ? error.status : undefined
    const message =
      status === 404
        ? "This invite link isn't valid."
        : status === 400
          ? 'This invite has expired or was already used.'
          : "We couldn't load this invite. Please try again."

    return (
      <AuthLayout>
        <div className='space-y-4 text-center'>
          <div className='space-y-1'>
            <h1 className='text-2xl font-bold tracking-tight'>
              Invite unavailable
            </h1>
            <p className='text-sm text-muted-foreground'>{message}</p>
          </div>
          <BackToSignIn />
        </div>
      </AuthLayout>
    )
  }

  if (!data) return null

  return (
    <AuthLayout>
      <div className='space-y-1'>
        <h1 className='text-2xl font-bold tracking-tight'>
          Welcome, {data.restaurant.name}
        </h1>
        <p className='text-sm text-muted-foreground'>
          {data.restaurant.description || 'Set a password to activate your account.'}
        </p>
        <p className='text-xs text-muted-foreground'>{data.email}</p>
      </div>

      <div className='mt-6'>
        <MerchantInviteForm token={token} onSuccess={() => setAccepted(true)} />
      </div>
    </AuthLayout>
  )
}
