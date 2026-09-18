import { releases } from '../data/releases';
import styles from './Updates.module.css';

export function Updates() {
  return (
    <section className={styles.page}>
      <div className="page-heading">
        <p className="eyebrow">KOTOBA DAILY</p>
        <h1>Release notes</h1>
      </div>

      {releases.map((release) => (
        <section key={release.date} className={styles.release}>
          <div className={styles.meta}>
            <span>{release.version ? `v${release.version}` : '초기 배포'}</span>
            <time dateTime={release.date.replaceAll('.', '-')}>{release.date}</time>
          </div>
          <h2>{release.title}</h2>
          <ul>
            {release.changes.map((change) => (
              <li key={change}>{change}</li>
            ))}
          </ul>
        </section>
      ))}
    </section>
  );
}
