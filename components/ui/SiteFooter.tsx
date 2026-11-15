import styles from "./SiteFooter.module.css";

export default function SiteFooter({ compact = false }: { compact?: boolean }) {
  return (
    <footer className={`${styles.footer} ${compact ? styles.compact : styles.full}`}>
      <small>© {new Date().getFullYear()} clempope</small>
    </footer>
  );
}
