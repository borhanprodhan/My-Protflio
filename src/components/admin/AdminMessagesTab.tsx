import { deleteDoc, doc, serverTimestamp, updateDoc } from 'firebase/firestore';
import { Trash2 } from 'lucide-react';
import { useMemo, useState } from 'react';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { MESSAGE_STATUSES, type ContactMessage, type MessageStatus } from '../../types/portfolio';

interface AdminMessagesTabProps {
  messages: ContactMessage[];
  firestoreReady: boolean;
}

function formatFirestoreDate(val: unknown): string {
  if (!val) return '—';
  if (typeof val === 'object' && val !== null && 'toDate' in val) {
    const fn = (val as { toDate?: () => Date }).toDate;
    if (typeof fn === 'function') {
      return fn().toLocaleString();
    }
  }
  if (typeof val === 'string') return new Date(val).toLocaleString();
  return '—';
}

const STATUS_BADGE_STYLES: Record<MessageStatus, string> = {
  New: 'text-[#38BDF8]',
  Contacted: 'text-amber-400',
  'In Progress': 'text-[#A78BFA]',
  Completed: 'text-emerald-400',
  Archived: 'text-slate-500',
};

export function AdminMessagesTab({ messages, firestoreReady }: AdminMessagesTabProps) {
  const [filter, setFilter] = useState<string>('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === 'All') return messages;
    return messages.filter((m) => m.status === filter);
  }, [messages, filter]);

  const selected = useMemo(
    () => messages.find((m) => m.id === selectedId) || filtered[0] || null,
    [messages, filtered, selectedId]
  );

  const handleStatusChange = async (msgId: string, nextStatus: MessageStatus) => {
    setBusyId(msgId);
    try {
      await updateDoc(doc(db, 'contact_messages', msgId), {
        status: nextStatus,
        updatedAt: serverTimestamp(),
      });
    } catch (err) {
      handleFirestoreError(err, OperationType.UPDATE, `contact_messages/${msgId}`);
    } finally {
      setBusyId(null);
    }
  };

  const handleDelete = async (msgId: string) => {
    setBusyId(msgId);
    try {
      await deleteDoc(doc(db, 'contact_messages', msgId));
      if (selectedId === msgId) setSelectedId(null);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `contact_messages/${msgId}`);
    } finally {
      setBusyId(null);
    }
  };

  if (!firestoreReady) {
    return (
      <div className="rounded-xl border border-slate-800 bg-[#111827] p-6 text-sm text-slate-300">
        Connect your Firebase Admin Google session above to read and manage private contact inquiries.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-1.5 rounded-lg border border-slate-800 bg-[#111827] p-1">
          {['All', ...MESSAGE_STATUSES].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilter(st)}
              className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                filter === st ? 'bg-[#7C3AED] text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
        <p className="font-mono-tech text-xs text-slate-400">
          {filtered.length} {filtered.length === 1 ? 'inquiry' : 'inquiries'}
        </p>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-[#111827] p-10 text-center text-sm text-slate-400">
          No inquiries found for this filter.
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-12">
          <div className="space-y-2 lg:col-span-5">
            {filtered.map((msg) => {
              const isSelected = selected?.id === msg.id;
              return (
                <button
                  key={msg.id}
                  type="button"
                  onClick={() => setSelectedId(msg.id)}
                  className={`w-full rounded-xl border p-4 text-left transition-colors ${
                    isSelected
                      ? 'border-[#38BDF8] bg-[#111827]'
                      : 'border-slate-800 bg-[#111827]/70 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-sm text-[#F8FAFC] truncate">
                      {msg.fullName}
                    </span>
                    <span className={`text-xs font-medium ${STATUS_BADGE_STYLES[msg.status]}`}>
                      {msg.status}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-400 truncate">{msg.serviceRequired}</p>
                  <p className="mt-1 font-mono-tech text-[11px] text-slate-500">
                    {formatFirestoreDate(msg.submittedAt)}
                  </p>
                </button>
              );
            })}
          </div>

          {selected && (
            <div className="rounded-xl border border-slate-800 bg-[#111827] p-6 lg:col-span-7">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="font-display text-xl font-semibold text-[#F8FAFC]">
                    {selected.fullName}
                  </h3>
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
                    <a href={`mailto:${selected.email}`} className="text-[#38BDF8] hover:underline">
                      {selected.email}
                    </a>
                    <span aria-hidden="true">·</span>
                    <span className="tabular-nums">{selected.phone}</span>
                    {selected.companyName && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span>{selected.companyName}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <select
                    aria-label="Update message status"
                    disabled={busyId === selected.id}
                    value={selected.status}
                    onChange={(e) =>
                      handleStatusChange(selected.id, e.target.value as MessageStatus)
                    }
                    className="rounded-lg border border-slate-700 bg-[#080B14] px-3 py-1.5 text-xs font-medium text-[#F8FAFC] focus:border-[#38BDF8] focus:outline-none"
                  >
                    {MESSAGE_STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>

                  <button
                    type="button"
                    disabled={busyId === selected.id}
                    onClick={() => handleDelete(selected.id)}
                    aria-label="Delete inquiry"
                    className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-700 text-slate-400 hover:border-red-500/50 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="mt-4 grid gap-4 border-b border-slate-800 pb-4 text-xs sm:grid-cols-3">
                <div>
                  <span className="text-slate-400">Service Required</span>
                  <p className="mt-1 font-medium text-slate-200">{selected.serviceRequired}</p>
                </div>
                <div>
                  <span className="text-slate-400">Project Budget</span>
                  <p className="mt-1 font-medium text-slate-200">
                    {selected.projectBudget || 'Not specified'}
                  </p>
                </div>
                <div>
                  <span className="text-slate-400">Submitted</span>
                  <p className="mt-1 font-mono-tech text-slate-200">
                    {formatFirestoreDate(selected.submittedAt)}
                  </p>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs text-slate-400">Message</p>
                <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
                  {selected.message}
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
