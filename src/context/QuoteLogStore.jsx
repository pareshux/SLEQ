import { createContext, useContext, useState } from 'react';

// ─── Status styles ─────────────────────────────────────────────────────────────

export const STATUS_STYLES = {
  'Census Received':     { bg: '#fff3e0', color: '#b25f01', border: '#ffe0b2' },
  'Ready for Associate': { bg: '#e1eaf7', color: '#1166bb', border: '#b5d4f4' },
  'Census Loaded':       { bg: '#e1eaf7', color: '#1166bb', border: '#b5d4f4' },
  'Waiting':             { bg: '#fff3e0', color: '#b25f01', border: '#ffe0b2' },
  'Received':            { bg: '#f0f7ec', color: '#4f8406', border: '#c8e6b0' },
  'In Progress':         { bg: '#e1eaf7', color: '#1166bb', border: '#b5d4f4' },
  'Entered':             { bg: '#f0f7ec', color: '#4f8406', border: '#c8e6b0' },
  'Done':                { bg: '#f0f7ec', color: '#4f8406', border: '#c8e6b0' },
  'DTQ':                 { bg: '#fdecea', color: '#c91717', border: '#f5c1c1' },
  'Handed Off':          { bg: '#f1f1f1', color: '#808080', border: '#e8e8e8' },
};

// ─── TPA master data ──────────────────────────────────────────────────────────

export const TPA_MAP = {
  CCAE: { code: 'CCAE', label: 'CCAE — Continental Casualty', carrier: 'Pan American', is: 'Sara K.',  uw: 'Steve Rogers', uwInitials: 'SR', notes: 'Standard processing. All lines eligible.' },
  ASR:  { code: 'ASR',  label: 'ASR — American Standard Resources', carrier: 'Aetna',   is: 'James M.', uw: 'Jason M.',     uwInitials: 'JM', notes: 'Large group focus. Renewal SLA: 14 days.' },
  IMS:  { code: 'IMS',  label: 'IMS — Integrated Medical Solutions',  carrier: 'BCBS',   is: 'Linda T.', uw: 'Vicki C.',     uwInitials: 'VC', notes: 'West coast accounts. Min 10 lives.' },
};

export const TPA_OPTIONS = Object.values(TPA_MAP);

// ─── Initial rows ─────────────────────────────────────────────────────────────

export const INITIAL_ROWS = [
  {
    id: 1, groupName: 'Heartland Manufacturing Co', type: 'RENEWAL', tpa: 'CCAE',
    producer: 'Allied Benefits Group', effectiveDate: 'May 1, 2025',
    assignedUW: 'SR', requestDate: '2026-04-15', deadline: '2026-04-23',
    censusStatus: 'Ready for Associate', sob: 'Received', risk: 'Received', setup: 'Done',
    isRush: true, isDTQ: false, isDuplicate: false, isHandedOff: false,
  },
  {
    id: 2, groupName: 'Ironwood Industries', type: 'RENEWAL', tpa: 'CCAE',
    producer: 'Summit Insurance Brokers', effectiveDate: 'Jun 1, 2025',
    assignedUW: 'SR', requestDate: '2026-04-12', deadline: '2026-04-30',
    censusStatus: 'Waiting', sob: 'Received', risk: '—', setup: '—',
    isRush: false, isDTQ: false, isDuplicate: false, isHandedOff: false,
  },
  {
    id: 3, groupName: 'Meridian Health Partners', type: 'RENEWAL', tpa: 'ASR',
    producer: 'Midwest Benefits Consulting', effectiveDate: 'Jul 1, 2025',
    assignedUW: 'JM', requestDate: '2026-04-08', deadline: '2026-04-20',
    censusStatus: 'Census Loaded', sob: 'Entered', risk: 'Entered', setup: 'Done',
    isRush: false, isDTQ: false, isDuplicate: false, isHandedOff: true,
  },
  {
    id: 4, groupName: 'Prairie Schools Cooperative', type: 'RENEWAL', tpa: 'ASR',
    producer: 'Coastal Benefits Group', effectiveDate: 'Aug 1, 2025',
    assignedUW: 'JM', requestDate: '2026-04-10', deadline: '2026-04-28',
    censusStatus: 'Census Loaded', sob: 'Entered', risk: 'Entered', setup: 'Done',
    isRush: false, isDTQ: false, isDuplicate: false, isHandedOff: false,
  },
  {
    id: 5, groupName: 'Blue Ridge Medical Group', type: 'NEW', tpa: 'IMS',
    producer: 'Pacific Benefits Advisors', effectiveDate: '—',
    assignedUW: 'VC', requestDate: '2026-04-16', deadline: '2026-04-18',
    censusStatus: 'Census Received', sob: '—', risk: '—', setup: '—',
    isRush: false, isDTQ: true, isDuplicate: false, isHandedOff: false,
  },
  {
    id: 6, groupName: 'Cascade River Schools', type: 'NEW', tpa: 'IMS',
    producer: 'Pacific Benefits Advisors', effectiveDate: '—',
    assignedUW: 'VC', requestDate: '2026-04-17', deadline: '2026-04-24',
    censusStatus: 'Census Received', sob: '—', risk: '—', setup: '—',
    isRush: false, isDTQ: false, isDuplicate: false, isHandedOff: false,
  },
  {
    id: 7, groupName: 'Summit Logistics LLC', type: 'NEW', tpa: 'CCAE',
    producer: 'Allied Benefits Group', effectiveDate: '—',
    assignedUW: 'SR', requestDate: '2026-04-16', deadline: '2026-04-25',
    censusStatus: 'Census Received', sob: '—', risk: '—', setup: 'Done',
    isRush: false, isDTQ: false, isDuplicate: true, isHandedOff: false,
  },
  {
    id: 8, groupName: 'Valley Community Hospital', type: 'NEW', tpa: 'ASR',
    producer: 'Midwest Benefits Consulting', effectiveDate: '—',
    assignedUW: 'JM', requestDate: '2026-04-19', deadline: '2026-05-02',
    censusStatus: 'Census Received', sob: '—', risk: '—', setup: 'Done',
    isRush: false, isDTQ: false, isDuplicate: false, isHandedOff: false,
  },
  // Extra record: same name as #7 but different TPA — enables "Different TPA" demo in the autocomplete
  {
    id: 9, groupName: 'Summit Logistics LLC', type: 'RENEWAL', tpa: 'ASR',
    producer: 'Summit Insurance Brokers', effectiveDate: 'May 1, 2025',
    assignedUW: 'JM', requestDate: '2026-03-20', deadline: '2026-03-28',
    censusStatus: 'Census Loaded', sob: 'Entered', risk: 'Entered', setup: 'Done',
    isRush: false, isDTQ: false, isDuplicate: false, isHandedOff: false,
  },
];

// ─── Context ──────────────────────────────────────────────────────────────────

const QuoteLogContext = createContext(null);

export function QuoteLogProvider({ children }) {
  const [rows, setRows]                 = useState(INITIAL_ROWS);
  const [pendingToast, setPendingToast] = useState(null);

  function addRow(row) {
    const newRow = { ...row, id: Date.now(), isDTQ: false, isDuplicate: false, isHandedOff: false };
    // Rush cases prepend to the top of the list
    setRows((prev) => (row.isRush ? [newRow, ...prev] : [...prev, newRow]));
    setPendingToast(`RFP created — ${row.groupName} added to queue`);
  }

  function updateRow(id, changes) {
    setRows((prev) => prev.map((r) => (r.id === id ? { ...r, ...changes } : r)));
  }

  function clearToast() { setPendingToast(null); }

  return (
    <QuoteLogContext.Provider value={{ rows, addRow, updateRow, pendingToast, clearToast }}>
      {children}
    </QuoteLogContext.Provider>
  );
}

export function useQuoteLog() {
  return useContext(QuoteLogContext);
}
