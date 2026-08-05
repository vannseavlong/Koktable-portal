import { PhonePreview } from './components/phone-preview'

type AuthLayoutProps = {
  children: React.ReactNode
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className='grid min-h-svh lg:grid-cols-2'>
      <div className='relative hidden items-center justify-center overflow-hidden bg-linear-to-br from-[#D6EAE4] via-[#F2E8E0] to-[#E4DFF2] lg:flex'>
        <div className='absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.5),transparent_60%)]' />
        <div className='relative'>
          <PhonePreview />
        </div>
      </div>
      <div className='flex items-center justify-center bg-background p-6 sm:p-10'>
        <div className='w-full max-w-sm'>{children}</div>
      </div>
    </div>
  )
}
