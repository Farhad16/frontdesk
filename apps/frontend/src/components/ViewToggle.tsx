import {t} from '../i18n'
import type {ViewMode} from '../lib/viewMode'
import styles from './ViewToggle.module.css'

export function ViewToggle({mode, onChange}: {mode: ViewMode; onChange: (mode: ViewMode) => void}) {
  const onQueue = mode === 'queue'

  return (
    <div className={styles.fdToggle} role="tablist">
      <button
        type="button"
        className={!onQueue ? `${styles.fdToggleBtn} ${styles.fdToggleOn}` : styles.fdToggleBtn}
        onClick={() => onChange('thread')}
      >
        {t('view.thread')}
      </button>
      <button
        type="button"
        className={onQueue ? `${styles.fdToggleBtn} ${styles.fdToggleOn}` : styles.fdToggleBtn}
        onClick={() => onChange('queue')}
      >
        {t('view.queue')}
      </button>
    </div>
  )
}
