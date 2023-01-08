import styles from './Footer.module.css'

export default function Footer() {
  return (
    <footer className={styles.footer}>
      <p>Copyright © 2022-{new Date().getFullYear()} Georgi Yanev</p>
    </footer>
  )
}
