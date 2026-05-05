import { useState } from 'react'

/**
 * Props for CompanyAvatar component.
 * name     → company name (used for initials fallback)
 * logo_url → optional company logo URL
 * size     → controls dimensions (defaults to 'md')
 */
interface CompanyAvatarProps {
  name: string
  logo_url?: string
  size?: 'sm' | 'md' | 'lg'
}

/**
 * Size lookup map — maps size prop to Tailwind classes.
 * Defined outside component — never changes, no recreation on re-render.
 */
const sizeMap = {
  sm: 'w-10 h-10 rounded-lg text-sm',
  md: 'w-12 h-12 rounded-xl text-sm',
  lg: 'w-14 h-14 rounded-xl text-lg',
}

/**
 * CompanyAvatar — displays company logo or initials fallback.
 * Shows logo if logo_url exists and loads successfully.
 * Falls back to first 2 letters of company name if:
 *   - logo_url not provided
 *   - logo_url is broken (onError fires)
 *
 * Usage:
 *   <CompanyAvatar name="Acme Corp" />
 *   <CompanyAvatar name="Acme Corp" logo_url="https://..." size="lg" />
 */
const CompanyAvatar = ({ name, logo_url, size = 'md' }: CompanyAvatarProps) => {
  // tracks if image failed to load — triggers fallback to initials
  const [imgError, setImgError] = useState(false)

  // show image only if URL exists AND hasn't errored
  const showImage = !!logo_url && !imgError

  return (
    <div className={`${sizeMap[size]} bg-blue-50 flex items-center justify-center font-medium text-blue-600 shrink-0 overflow-hidden`}>
      {showImage ? (
        // Show company logo
        // onError → sets imgError: true → re-renders with initials
        <img
          src={logo_url}
          alt={`${name} logo`}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        // Fallback — first 2 letters of company name
        name.slice(0, 2).toUpperCase()
      )}
    </div>
  )
}

export default CompanyAvatar