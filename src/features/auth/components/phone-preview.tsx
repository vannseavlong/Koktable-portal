/** Phone-frame mockup wrapping the real Restaurant mobile app home screen screenshot. */
export function PhonePreview() {
  return (
    <div className='w-70 rounded-[2.5rem] border-10 border-[#1A2420] bg-[#1A2420] shadow-2xl'>
      <div className='overflow-hidden rounded-[1.75rem]'>
        <img
          src='/images/KokTable.png'
          alt='Restaurant mobile app home screen'
          className='block h-auto w-70'
        />
      </div>
    </div>
  )
}
