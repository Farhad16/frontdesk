import type {
  IMessage,
  IRequestPayload,
  IUserPreference,
  Status,
} from "@frontdesk/types";
import {
  WuButton,
  WuCheckbox,
  WuDataTable,
  WuInput,
  type IWuTableColumnDef,
} from "@npm-questionpro/wick-ui-lib";
import { useEffect, useMemo, useRef, useState, type FormEvent } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { t } from "../i18n";
import { buildQuickPickInput, locate, quickPickSummary } from "./quickPick";
import { RequestBuilder } from "./RequestBuilder";
import styles from "./RequestMemberView.module.css";
import { formatTime } from "./threadFormat";
import { useGroupConfig } from "./useGroupConfig";
import { usePreferences } from "./usePreferences";
import { useThread, type ISendRequestInput } from "./useThread";

const HOLD_MS = 5000;
const STATUS_FILTERS: Array<Status | "ALL"> = [
  "ALL",
  "PENDING",
  "IN_PROGRESS",
  "DONE",
  "CANCELLED",
];
type DateFilter = "TODAY" | "WEEK" | "YEAR" | "DAY";
const DATE_FILTERS: Array<{ value: DateFilter; key: string }> = [
  { value: "TODAY", key: "member.dateToday" },
  { value: "WEEK", key: "member.dateWeek" },
  { value: "YEAR", key: "member.dateYear" },
];

function sameDay(a: Date, b: Date): boolean {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function startOfWeek(date: Date): number {
  const mondayOffset = (date.getDay() + 6) % 7;
  return new Date(
    date.getFullYear(),
    date.getMonth(),
    date.getDate() - mondayOffset,
  ).getTime();
}

// Track a min-width breakpoint so we can show a table on desktop and a simpler
// card list on phones.
function useMinWidth(query: string): boolean {
  const [matches, setMatches] = useState(
    () => window.matchMedia(`(min-width: ${query})`).matches,
  );
  useEffect(() => {
    const mq = window.matchMedia(`(min-width: ${query})`);
    const onChange = () => setMatches(mq.matches);
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

interface IPendingAction {
  id: string;
  kind: "send" | "cancel" | "delete";
  label: string;
  targetIds?: string[];
  commit: () => void;
}

interface IOrderRow {
  id: string;
  summary: string;
  time: string;
  statusKey: string;
  message: IMessage;
}

export function RequestMemberView() {
  const { key = "" } = useParams();
  const { user } = useAuth();
  const config = useGroupConfig(key);
  const { preferences } = usePreferences();
  const {
    messages,
    loading,
    error,
    sending,
    sendRequest,
    updateStatus,
    deleteMessage,
  } = useThread(key);

  const [builderOpen, setBuilderOpen] = useState(false);
  const [editing, setEditing] = useState<IMessage | null>(null);
  const [openText, setOpenText] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [pickMode, setPickMode] = useState(false);
  const [pickedPicks, setPickedPicks] = useState<Set<string>>(new Set());
  const [statusFilter, setStatusFilter] = useState<Status | "ALL">("ALL");
  const [dateFilter, setDateFilter] = useState<DateFilter>("TODAY");
  const [pickedDate, setPickedDate] = useState("");
  const [selectedRows, setSelectedRows] = useState<IOrderRow[]>([]);
  const [pendings, setPendings] = useState<IPendingAction[]>([]);
  const timers = useRef(new Map<string, ReturnType<typeof setTimeout>>());

  const catalog = config?.catalog ?? [];
  const isDesktop = useMinWidth("48rem");

  // Clear any in-flight hold timers on unmount so nothing fires after teardown.
  useEffect(() => {
    const map = timers.current;
    return () => map.forEach(clearTimeout);
  }, []);

  const myOrders = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now);
    const picked = pickedDate ? new Date(`${pickedDate}T00:00:00`) : null;
    const inRange = (iso: string) => {
      const date = new Date(iso);
      if (dateFilter === "DAY") return picked ? sameDay(date, picked) : true;
      if (dateFilter === "WEEK") return date.getTime() >= weekStart;
      if (dateFilter === "YEAR")
        return date.getFullYear() === now.getFullYear();
      return sameDay(date, now);
    };
    return messages
      .filter(
        (m) =>
          m.type === "REQUEST" &&
          m.sender.id === user?.id &&
          !m.deletedAt &&
          inRange(m.createdAt) &&
          (statusFilter === "ALL" || m.status === statusFilter),
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }, [messages, user?.id, statusFilter, dateFilter, pickedDate]);

  // Ids with a destructive action mid-hold → rows dim out, no checkbox/actions.
  const pendingTargetIds = useMemo(
    () => new Set(pendings.flatMap((p) => p.targetIds ?? [])),
    [pendings],
  );

  const orderRows = useMemo<IOrderRow[]>(
    () =>
      myOrders.map((m) => ({
        id: m.id,
        summary: m.summary ?? "",
        time: formatTime(m.createdAt),
        statusKey: (m.status ?? "").toLowerCase(),
        message: m,
      })),
    [myOrders],
  );
  const selectedAllPending =
    selectedRows.length > 0 &&
    selectedRows.every((r) => r.message.status === "PENDING");

  // Optimistic one-click: hold the action for HOLD_MS so the member can Undo
  // before it actually hits the server (no phantom orders reach staff).
  function queueAction(action: Omit<IPendingAction, "id">) {
    const id = `${action.kind}-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    setPendings((prev) => [...prev, { ...action, id }]);
    const timer = setTimeout(() => {
      action.commit();
      timers.current.delete(id);
      setPendings((prev) => prev.filter((p) => p.id !== id));
    }, HOLD_MS);
    timers.current.set(id, timer);
  }

  function undo(id: string) {
    const timer = timers.current.get(id);
    if (timer) clearTimeout(timer);
    timers.current.delete(id);
    setPendings((prev) => prev.filter((p) => p.id !== id));
  }

  function orderQuickPick(pref: IUserPreference) {
    const input = buildQuickPickInput(catalog, pref);
    if (!input) return;
    queueAction({
      kind: "send",
      label: input.summary,
      commit: () => void sendRequest(input),
    });
  }

  function togglePickMode() {
    setPickMode((on) => {
      if (on) setPickedPicks(new Set());
      return !on;
    });
  }

  function togglePick(itemKey: string) {
    setPickedPicks((prev) => {
      const next = new Set(prev);
      if (next.has(itemKey)) next.delete(itemKey);
      else next.add(itemKey);
      return next;
    });
  }

  // Combine all selected quick picks into ONE order (one request, many lines).
  function orderSelectedPicks() {
    const inputs = preferences
      .filter((pref) => pickedPicks.has(pref.itemKey))
      .map((pref) => buildQuickPickInput(catalog, pref))
      .filter((input): input is ISendRequestInput => Boolean(input));
    const items = inputs.flatMap((input) => input.items);
    if (items.length === 0) return;
    const summary = inputs.map((input) => input.summary).join(", ");
    setPickMode(false);
    setPickedPicks(new Set());
    queueAction({
      kind: "send",
      label: summary,
      commit: () => void sendRequest({ items, summary }),
    });
  }

  function submitOpenMessage(event: FormEvent) {
    event.preventDefault();
    const text = openText.trim();
    if (!text) return;
    setOpenText("");
    const assistance = catalog.find((category) => category.freeText);
    const input: ISendRequestInput = {
      items: [
        {
          category: assistance?.key ?? "assistance",
          item: "freeText",
          quantity: 1,
          summary: text,
        },
      ],
      summary: text,
    };
    queueAction({
      kind: "send",
      label: text,
      commit: () => void sendRequest(input),
    });
  }

  function cancelOrders(ids: string[], label: string) {
    clearSelection();
    queueAction({
      kind: "cancel",
      targetIds: ids,
      label,
      commit: () => ids.forEach((id) => void updateStatus(id, "CANCELLED")),
    });
  }

  function deleteOrders(ids: string[], label: string) {
    clearSelection();
    queueAction({
      kind: "delete",
      targetIds: ids,
      label,
      commit: () => ids.forEach((id) => void deleteMessage(id)),
    });
  }

  function clearSelection() {
    setSelectedRows([]);
  }

  function openBuilder() {
    setEditing(null);
    setBuilderOpen(true);
  }

  function openEdit(message: IMessage) {
    setEditing(message);
    setBuilderOpen(true);
  }

  function closeBuilder() {
    setBuilderOpen(false);
    setEditing(null);
  }

  // Editing a pending order = send the revised order, then drop the original
  // (backend has no payload-edit endpoint; replace is clean while pending).
  async function handleBuilderSend(input: ISendRequestInput) {
    const original = editing;
    await sendRequest(input);
    if (original) await deleteMessage(original.id);
  }

  const editingItems =
    editing && editing.payload && "items" in editing.payload
      ? (editing.payload as IRequestPayload).items
      : undefined;

  function bulkLabel(count: number, sample?: string) {
    return count === 1 && sample ? sample : `${count} ${t("member.orders")}`;
  }

  // Render a request's line items each on their own row (shared by table + cards).
  function renderSummary(message: IMessage, fallback: string) {
    const payload = message.payload;
    const items = payload && "items" in payload ? payload.items : null;
    const lines =
      items && items.length > 0
        ? items.map((l) => l.summary ?? "")
        : [fallback];
    return (
      <span className={styles.fdOrderSummary}>
        {lines.map((line, index) => (
          <span key={index} className={styles.fdOrderLine}>
            {line}
          </span>
        ))}
      </span>
    );
  }

  const orderColumns: IWuTableColumnDef<IOrderRow>[] = [
    {
      accessorKey: "summary",
      header: t("queue.colRequest"),
      cell: ({ row }) =>
        renderSummary(row.original.message, row.original.summary),
      size: 250,
    },
    {
      accessorKey: "time",
      header: t("queue.colTime"),
      cell: ({ row }) => (
        <span className={styles.fdOrderTime}>{row.original.time}</span>
      ),
      size: 150,
    },
    {
      accessorKey: "statusKey",
      header: t("queue.colStatus"),
      cell: ({ row }) =>
        row.original.statusKey ? (
          <span
            className={styles.fdStatusChip}
            data-status={row.original.statusKey}
          >
            {t(`status.${row.original.statusKey}`)}
          </span>
        ) : null,
      size: 150,
    },
    {
      accessorKey: "actions",
      header: "",
      headerAlign: "right",
      cellAlign: "right",
      cell: ({ row }) => {
        const message = row.original.message;
        if (message.status !== "PENDING" || pendingTargetIds.has(message.id)) {
          return null;
        }
        return (
          <span className={styles.fdOrderActions}>
            <WuButton
              type="button"
              size="sm"
              variant="iconOnly"
              className={`${styles.fdBtn} ${styles.fdIconBtn}`}
              aria-label={t("member.edit")}
              title={t("member.edit")}
              Icon={<span className="wm-edit" aria-hidden="true" />}
              onClick={() => openEdit(message)}
            />
            <WuButton
              type="button"
              size="sm"
              variant="iconOnly"
              className={`${styles.fdBtn} ${styles.fdIconBtn}`}
              aria-label={t("status.cancel")}
              title={t("status.cancel")}
              Icon={<span className="wm-close" aria-hidden="true" />}
              onClick={() => cancelOrders([message.id], message.summary ?? "")}
            />
          </span>
        );
      },
      size: 100,
    },
  ];

  return (
    <div className={styles.fdMember}>
      <aside className={styles.fdSide}>
        <section className={styles.fdQuickSection}>
          <div className={styles.fdHeadRow}>
            <h2 className={styles.fdSectionTitle}>{t("member.quickPicks")}</h2>
            {preferences.length > 0 && (
              <WuButton
                type="button"
                size="sm"
                variant={pickMode ? "primary" : "outline"}
                className={styles.fdBtn}
                aria-pressed={pickMode}
                Icon={
                  <span
                    className={pickMode ? "wm-close" : "wm-library-add-check"}
                    aria-hidden="true"
                  />
                }
                onClick={togglePickMode}
              >
                {pickMode ? t("member.done") : t("member.selectMultiple")}
              </WuButton>
            )}
          </div>
          {preferences.length === 0 ? (
            <button
              type="button"
              className={styles.fdQuickEmpty}
              onClick={openBuilder}
            >
              <span className={styles.fdQuickEmptyIcon} aria-hidden="true">
                ＋
              </span>
              <span>{t("member.quickPicksEmpty")}</span>
            </button>
          ) : (
            <div className={styles.fdQuickRow}>
              {preferences.map((pref) => {
                const located = locate(catalog, pref.itemKey);
                if (!located) return null;
                const { item } = located;
                const picked = pickedPicks.has(pref.itemKey);
                return (
                  <button
                    key={pref.itemKey}
                    type="button"
                    className={styles.fdQuickCard}
                    data-picked={pickMode && picked}
                    onClick={() =>
                      pickMode ? togglePick(pref.itemKey) : orderQuickPick(pref)
                    }
                  >
                    {pickMode && (
                      <span className={styles.fdPickTick} aria-hidden="true">
                        <WuCheckbox checked={picked} onChange={() => {}} />
                      </span>
                    )}
                    <span className={styles.fdQuickEmoji} aria-hidden="true">
                      {item.emoji}
                    </span>
                    <span className={styles.fdQuickMeta}>
                      <span className={styles.fdQuickName}>
                        {t(item.labelKey)}
                        {pref.isDefault && (
                          <span
                            className={styles.fdQuickStar}
                            aria-hidden="true"
                          >
                            ★
                          </span>
                        )}
                      </span>
                      <span className={styles.fdQuickSub}>
                        {quickPickSummary(item, pref.options)}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          )}
          {pickMode && pickedPicks.size > 0 && (
            <div className={styles.fdPickBar}>
              <WuButton
                variant="primary"
                className={styles.fdPickSend}
                onClick={orderSelectedPicks}
              >
                {`${t("member.orderSelected")} (${pickedPicks.size})`}
              </WuButton>
            </div>
          )}
        </section>
      </aside>

      <div className={styles.fdMain}>
        <section className={styles.fdOrdersSection}>
          <div className={styles.fdOrdersHead}>
            <div className={styles.fdHeadRow}>
              <h2 className={styles.fdSectionTitle}>{t("member.myOrders")}</h2>
              <div className={styles.fdHeadActions}>
                <WuButton
                  type="button"
                  size="sm"
                  variant="iconOnly"
                  className={`${styles.fdBtn} ${styles.fdIconBtn}`}
                  aria-label={t("member.filters")}
                  aria-expanded={filtersOpen}
                  Icon={<span className="wm-filter-alt" aria-hidden="true" />}
                  onClick={() => setFiltersOpen((open) => !open)}
                />
              </div>
            </div>
            <div
              className={styles.fdFilterPanel}
              data-open={filtersOpen}
              aria-hidden={!filtersOpen}
            >
              <div className={styles.fdFilterInner}>
                <div className={styles.fdFilters}>
                  {STATUS_FILTERS.map((value) => (
                    <button
                      key={value}
                      type="button"
                      className={
                        statusFilter === value
                          ? `${styles.fdChip} ${styles.fdChipOn}`
                          : styles.fdChip
                      }
                      onClick={() => setStatusFilter(value)}
                    >
                      {value === "ALL"
                        ? t("queue.filterAllStatus")
                        : t(`status.${value.toLowerCase()}`)}
                    </button>
                  ))}
                </div>
                <div className={styles.fdFilters}>
                  {DATE_FILTERS.map(({ value, key: labelKey }) => (
                    <button
                      key={value}
                      type="button"
                      className={
                        dateFilter === value && !pickedDate
                          ? `${styles.fdChip} ${styles.fdChipOn}`
                          : styles.fdChip
                      }
                      onClick={() => {
                        setDateFilter(value);
                        setPickedDate("");
                      }}
                    >
                      {t(labelKey)}
                    </button>
                  ))}
                  <input
                    type="date"
                    className={`${styles.fdDateInput}${pickedDate ? ` ${styles.fdDateInputOn}` : ""}`}
                    value={pickedDate}
                    aria-label={t("member.datePick")}
                    onChange={(event) => {
                      setPickedDate(event.target.value);
                      setDateFilter("DAY");
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {error && <div className={styles.fdState}>{error}</div>}

          <div className={styles.fdTableWrap}>
            <WuDataTable
              data={orderRows}
              columns={orderColumns}
              size="default"
              stickyHeader
              isLoading={loading}
              rowSelection={{
                isEnabled: true,
                selectedRows,
                onRowSelect: setSelectedRows,
                rowUniqueKey: "id",
                isRowDisabled: (row) => pendingTargetIds.has(row.id),
              }}
              HeaderAction={
                selectedRows.length > 0 ? (
                  <span className={styles.fdToolbarActions}>
                    {selectedAllPending && (
                      <WuButton
                        type="button"
                        size="sm"
                        variant="outline"
                        className={styles.fdBtn}
                        aria-label={t("status.cancel")}
                        title={t("status.cancel")}
                        Icon={<span className="wm-close" aria-hidden="true" />}
                        onClick={() =>
                          cancelOrders(
                            selectedRows.map((r) => r.id),
                            bulkLabel(
                              selectedRows.length,
                              selectedRows[0]?.summary,
                            ),
                          )
                        }
                      >
                        {t("status.cancel")}
                      </WuButton>
                    )}
                    <WuButton
                      type="button"
                      size="sm"
                      variant="outline"
                      className={`${styles.fdBtn} ${styles.fdBulkDanger}`}
                      aria-label={t("member.delete")}
                      title={t("member.delete")}
                      Icon={<span className="wm-delete" aria-hidden="true" />}
                      onClick={() =>
                        deleteOrders(
                          selectedRows.map((r) => r.id),
                          bulkLabel(
                            selectedRows.length,
                            selectedRows[0]?.summary,
                          ),
                        )
                      }
                    >
                      {t("member.delete")}
                    </WuButton>
                  </span>
                ) : undefined
              }
              NoDataContent={
                <p className={styles.fdEmpty}>{t("member.myOrdersEmpty")}</p>
              }
            />
          </div>
        </section>

        <div className={styles.fdComposeBar}>
          <WuButton
            type="button"
            variant="iconOnly"
            className={`${styles.fdBtn} ${styles.fdIconBtn} ${styles.fdBuildBtn}`}
            aria-label={t("member.buildOrder")}
            title={t("member.buildOrder")}
            Icon={<span className="wm-add" aria-hidden="true" />}
            onClick={openBuilder}
          />
          <form className={styles.fdOpenForm} onSubmit={submitOpenMessage}>
            <WuInput
              variant="outlined"
              type="text"
              placeholder={t("member.openPlaceholder")}
              value={openText}
              onChange={(event) => setOpenText(event.target.value)}
            />
            <WuButton
              type="submit"
              variant="iconOnly"
              className={`${styles.fdBtn} ${styles.fdIconBtn} ${styles.fdSendBtn}`}
              aria-label={t("member.openSend")}
              title={t("member.openSend")}
              Icon={<span className="wm-send" aria-hidden="true" />}
              disabled={!openText.trim()}
            />
          </form>
        </div>
      </div>

      {pendings.length > 0 && (
        <div className={styles.fdSnacks} role="status" aria-live="polite">
          {pendings.map((pending) => (
            <div
              key={pending.id}
              className={styles.fdSnack}
              data-kind={pending.kind}
            >
              <span className={styles.fdSnackText}>
                <b>
                  {pending.kind === "send"
                    ? t("member.toastOrdered")
                    : pending.kind === "cancel"
                      ? t("member.toastCancelling")
                      : t("member.toastDeleting")}
                </b>
                <span className={styles.fdSnackLabel}>{pending.label}</span>
              </span>
              <button
                type="button"
                className={styles.fdUndo}
                onClick={() => undo(pending.id)}
              >
                {t("member.undo")}
              </button>
              <span className={styles.fdSnackBar} aria-hidden="true" />
            </div>
          ))}
        </div>
      )}

      {builderOpen && config && (
        <RequestBuilder
          config={config}
          sending={sending}
          onClose={closeBuilder}
          onSend={editing ? handleBuilderSend : sendRequest}
          initialCart={editingItems}
        />
      )}
    </div>
  );
}
