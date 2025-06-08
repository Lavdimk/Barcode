import styles from './Dashboard.module.css';

export default function Dashboard() {
  return (
    <div className={styles.wrapper}>
      <div className={styles.grid}>
        <div className={`${styles.card} ${styles.card1}`}>All Sales</div>
        <div className={`${styles.card} ${styles.card2}`}>Total sales- 10 orders</div>
        <div className={`${styles.card} ${styles.card3}`}>Top products</div>
        <div className={`${styles.card} ${styles.card4}`}>Container 4</div>
        <div className={`${styles.card} ${styles.card5}`}>Container 5</div>
      </div>
    </div>
  );
}
