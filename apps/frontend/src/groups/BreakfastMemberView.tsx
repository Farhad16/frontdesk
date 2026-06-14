import type {IUserPreference} from '@frontdesk/types'
import {useState} from 'react'
import {useParams} from 'react-router-dom'
import {QuickPicks} from './QuickPicks'
import {buildQuickPickInput} from './quickPick'
import {RequestBuilder} from './RequestBuilder'
import {Thread} from './Thread'
import {useCompose} from './useCompose'
import {useGroupConfig} from './useGroupConfig'
import styles from './BreakfastMemberView.module.css'

// Catalog group member view (Breakfast): keeps the chat thread (left) but adds
// the Requests-style one-tap quick pick column (right). Tapping a pick posts
// an order; the empty state opens the cart builder.
export function BreakfastMemberView() {
  const {key = ''} = useParams()
  const config = useGroupConfig(key)
  const {sending, sendRequest} = useCompose(key)
  const [builderOpen, setBuilderOpen] = useState(false)

  async function orderQuickPick(pref: IUserPreference) {
    if (sending) return
    const input = buildQuickPickInput(config?.catalog ?? [], pref)
    if (!input) return
    await sendRequest(input)
  }

  return (
    <div className={styles.fdMember}>
      <div className={styles.fdMain}>
        <Thread />
      </div>
      <aside className={styles.fdSide}>
        <QuickPicks
          catalog={config?.catalog ?? []}
          onPick={pref => void orderQuickPick(pref)}
          onAdd={() => setBuilderOpen(true)}
        />
      </aside>

      {builderOpen && config && (
        <RequestBuilder
          config={config}
          sending={sending}
          onClose={() => setBuilderOpen(false)}
          onSend={sendRequest}
        />
      )}
    </div>
  )
}
