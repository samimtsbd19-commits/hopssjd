// React Imports
import type { SVGProps } from 'react'

const SkynityLogo = (props: SVGProps<SVGSVGElement>) => {
  return (
    <svg width={32} height={32} viewBox='0 0 32 32' fill='none' xmlns='http://www.w3.org/2000/svg' {...props}>
      <path
        d='M28.4 8.6L16.2 1.9C15.8 1.7 15.3 1.8 14.9 2L2.7 8.6C2.3 8.8 2 9.2 2 9.7V22.3C2 22.8 2.3 23.2 2.7 23.4L14.9 30C15.3 30.2 15.8 30.3 16.2 30.1L28.4 23.4C28.8 23.2 29.1 22.8 29.1 22.3V9.7C29.1 9.2 28.8 8.8 28.4 8.6Z'
        fill='currentColor'
        fillOpacity='0.2'
      />
      <path
        d='M15 4V14L6 9L15 4ZM17 4V14L26 9L17 4ZM6 23V13L15 18V28L6 23ZM26 23V13L17 18V28L26 23Z'
        fill='currentColor'
      />
      <circle cx='16' cy='16' r='3' fill='white' />
    </svg>
  )
}

export default SkynityLogo
