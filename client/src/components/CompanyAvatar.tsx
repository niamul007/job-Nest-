import { useState } from 'react'

interface CompanyAvatarProps {
  name: string
  logo_url?: string
  size?: 'sm' | 'md' | 'lg'
}

const sizeMap = {
  sm: 'w-10 h-10 rounded-lg text-sm',
  md: 'w-12 h-12 rounded-xl text-sm',
  lg: 'w-14 h-14 rounded-xl text-lg',
}

const CompanyAvatar = ({ name, logo_url, size = 'md' }: CompanyAvatarProps) => {
  const [imgError, setImgError] = useState(false)
  const showImage = !!logo_url && !imgError

  return (
    <div className={`${sizeMap[size]} bg-blue-50 flex items-center justify-center font-medium text-blue-600 shrink-0 overflow-hidden`}>
      {showImage ? (
        <img
          src={logo_url}
          alt={`${name} logo`}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        name.slice(0, 2).toUpperCase()
      )}
    </div>
  )
}

export default CompanyAvatar
