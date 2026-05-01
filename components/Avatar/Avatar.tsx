import styles from './Avatar.module.css'

interface AvatarProps {
  name: string
}

function getInitials(name: string): string {
  const upperLetters = name.match(/[A-Z]/g) ?? []
  if (upperLetters.length >= 2) {
    return upperLetters[0] + upperLetters[1]
  }
  return name.charAt(0).toUpperCase()
}

export default function Avatar({ name }: AvatarProps) {
  return (
    <div className={styles.avatar} aria-label={name}>
      {getInitials(name)}
    </div>
  )
}
