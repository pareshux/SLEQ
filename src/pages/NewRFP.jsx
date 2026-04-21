import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  Box, Button, Grid, Typography, Stack, Paper, Chip, Divider,
  Switch, FormControlLabel, TextField, Autocomplete, Select,
  MenuItem, FormControl, InputLabel, Dialog, DialogTitle,
  DialogContent, DialogActions, Collapse, Tooltip, IconButton,
  InputAdornment, CircularProgress,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import CloseIcon from '@mui/icons-material/Close';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { format, differenceInCalendarDays, addDays, parseISO } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { C } from '../theme/theme';
import { TPA_MAP, TPA_OPTIONS, useQuoteLog } from '../context/QuoteLogStore';

// ─── Constants ─────────────────────────────────────────────────────────────────

const TODAY = new Date('2026-04-20');

const PRODUCER_OPTIONS = [
  { agency: 'Allied Benefits Group',       contact: 'Dana Moore' },
  { agency: 'Midwest Benefits Consulting', contact: 'Liz Harrington' },
  { agency: 'Pacific Benefits Advisors',   contact: 'Greg Solis' },
  { agency: 'Summit Insurance Brokers',    contact: 'Tanya Kemp' },
  { agency: 'Coastal Benefits Group',      contact: 'Ryan Perez' },
];

const SIC_MAP = {
  '2759': { desc: 'Commercial Printing, NEC',               cat: 'Manufacturing' },
  '8011': { desc: 'Offices of Physicians',                  cat: 'Healthcare' },
  '5411': { desc: 'Grocery Stores',                         cat: 'Retail' },
  '7372': { desc: 'Prepackaged Software',                   cat: 'Technology' },
  '6411': { desc: 'Insurance Agents & Brokers',             cat: 'Finance' },
  '1731': { desc: 'Electrical Work',                        cat: 'Construction' },
  '4811': { desc: 'Telephone Communications',               cat: 'Utilities' },
  '7011': { desc: 'Hotels & Motels',                        cat: 'Hospitality' },
  '8049': { desc: 'Offices of Other Health Practitioners',  cat: 'Healthcare' },
  '3559': { desc: 'Special Industry Machinery, NEC',        cat: 'Manufacturing' },
  '8742': { desc: 'Management Consulting Services',         cat: 'Professional Services' },
  '5047': { desc: 'Medical & Hospital Equipment',           cat: 'Distribution' },
  '1521': { desc: 'Residential Building Contractors',       cat: 'Construction' },
};
const FORBIDDEN_SIC = ['9999', '7011'];
const NON_QUOTABLE  = ['CA', 'NY', 'WA'];

const ZIP_MAP = {
  '606': 'IL', '600': 'IL', '601': 'IL',
  '100': 'NY', '110': 'NY',
  '900': 'CA', '902': 'CA',
  '770': 'TX', '773': 'TX',
  '330': 'FL', '331': 'FL',
  '021': 'MA', '022': 'MA',
  '481': 'MI', '482': 'MI',
  '441': 'OH', '440': 'OH',
  '303': 'GA', '300': 'GA',
  '200': 'DC', '202': 'DC',
  '400': 'KY', '500': 'IA',
  '700': 'LA', '800': 'CO',
  '980': 'WA', '981': 'WA',
};

const UW_OPTIONS = ['Steve Rogers', 'Jason M.', 'Vicki C.', 'Trevor L.', 'Traci B.'];

// ─── Helpers ───────────────────────────────────────────────────────────────────

function addBusinessDays(date, n) {
  let d = new Date(date), count = 0;
  while (count < n) { d = addDays(d, 1); if (d.getDay() !== 0 && d.getDay() !== 6) count++; }
  return d;
}

function fuzzy(a, b) {
  if (!a || !b || a.length < 2) return false;
  return a.toLowerCase().includes(b.toLowerCase().slice(0, 6)) ||
         b.toLowerCase().includes(a.toLowerCase().slice(0, 6));
}

// ─── Inline banner ─────────────────────────────────────────────────────────────

const BANNER_VARIANTS = {
  warning: { bg: '#fff3e0', border: C.orange,   text: C.orange },
  error:   { bg: '#fdecea', border: C.red,      text: C.red },
  info:    { bg: '#e1eaf7', border: C.blueLight, text: C.blueLight },
  success: { bg: '#f0f7ec', border: C.green,    text: C.green },
};

function InlineBanner({ variant = 'info', children, onClose }) {
  const s = BANNER_VARIANTS[variant];
  return (
    <Box sx={{ mt: 1, p: '12px 16px', backgroundColor: s.bg, borderLeft: `3px solid ${s.border}`, borderRadius: '6px', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 1 }}>
      <Typography sx={{ fontSize: '14px', color: '#28313e', lineHeight: 1.6, flex: 1 }}>{children}</Typography>
      {onClose && (
        <IconButton size="small" onClick={onClose} sx={{ p: 0.25, ml: 0.5, flexShrink: 0, color: C.grayMid }}>
          <CloseIcon sx={{ fontSize: 14 }} />
        </IconButton>
      )}
    </Box>
  );
}

// ─── Section card with progressive disclosure ──────────────────────────────────

function SectionCard({ title, locked, children, lockedHint }) {
  return (
    <Paper elevation={0}
      sx={{
        border: `1px solid ${C.divider}`, borderRadius: '8px', p: '24px',
        bgcolor: C.bgPaper, transition: 'opacity 0.2s', position: 'relative',
        boxShadow: 'none',
        ...(locked && { opacity: 0.42, pointerEvents: 'none' }),
      }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between"
        sx={{ mb: '16px', pb: '12px', borderBottom: `1px solid ${C.divider}` }}>
        <Typography sx={{ fontSize: '11px', fontWeight: 500, color: C.grayMid, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {title}
        </Typography>
        {locked && (
          <Tooltip title={lockedHint || 'Complete earlier sections to unlock'}>
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <LockOutlinedIcon sx={{ fontSize: 13, color: C.grayMid }} />
              <Typography sx={{ fontSize: '11px', color: C.grayMid }}>Locked</Typography>
            </Stack>
          </Tooltip>
        )}
      </Stack>
      {children}
    </Paper>
  );
}

// ─── Auto-filled read-only field with pencil override ─────────────────────────

function AutoFilledField({ label, value, onEdit, flash }) {
  return (
    <Box>
      <Typography sx={{ fontSize: '13px', fontWeight: 500, color: '#28313e', mb: '6px' }}>{label}</Typography>
      <Stack direction="row" alignItems="center"
        sx={{
          height: 40, borderRadius: '6px',
          border: `1px solid ${flash ? C.blueLight : C.divider}`,
          bgcolor: '#f1f1f1', px: 1.5, gap: 1,
          transition: 'border-color 0.4s',
        }}>
        <Typography sx={{ flexGrow: 1, fontSize: '14px', color: '#28313e' }}>{value || '—'}</Typography>
        {flash && <AutoAwesomeIcon sx={{ fontSize: 14, color: C.blueLight }} />}
        <Tooltip title={`Override ${label}`}>
          <IconButton size="small" onClick={onEdit} sx={{ p: 0.5 }}>
            <EditOutlinedIcon sx={{ fontSize: 14, color: C.grayMid }} />
          </IconButton>
        </Tooltip>
      </Stack>
      <Typography sx={{ fontSize: '12px', color: C.grayMid, mt: '4px' }}>Auto-filled from TPA</Typography>
    </Box>
  );
}

// ─── EHRC segmented Yes / No ──────────────────────────────────────────────────

function SegmentedYesNo({ value, onChange }) {
  return (
    <Stack direction="row" sx={{ border: `1px solid ${C.divider}`, borderRadius: '6px', overflow: 'hidden', width: 'fit-content' }}>
      {['Yes', 'No'].map((opt) => {
        const active = (opt === 'Yes' && value === true) || (opt === 'No' && value === false);
        return (
          <Box key={opt} component="button" onClick={() => onChange(opt === 'Yes')}
            sx={{ px: 2.5, py: 0.875, fontSize: '13px', fontWeight: 500, cursor: 'pointer', border: 'none', outline: 'none',
              bgcolor: active ? C.blueLight : 'transparent',
              color: active ? '#fff' : '#28313e',
              borderRight: opt === 'Yes' ? `1px solid ${C.divider}` : 'none',
              transition: 'background 0.15s',
              '&:hover': { bgcolor: active ? C.blueLight : C.blueLightBg },
            }}>
            {opt}
          </Box>
        );
      })}
    </Stack>
  );
}

// ─── Checklist item ───────────────────────────────────────────────────────────

function ChecklistItem({ label, done }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ py: '5px' }}>
      {done
        ? <CheckCircleIcon sx={{ fontSize: 15, color: C.green, flexShrink: 0 }} />
        : <RadioButtonUncheckedIcon sx={{ fontSize: 15, color: '#c0c0c0', flexShrink: 0 }} />}
      <Typography sx={{ fontSize: '14px', color: done ? C.black : C.grayMid, lineHeight: 1.4 }}>{label}</Typography>
    </Stack>
  );
}

// ─── Custom Group Name Dropdown ───────────────────────────────────────────────

function GroupNameDropdown({ value, onChange, onSelectRecord, rows, currentTPA, navigate }) {
  const [inputValue, setInputValue]  = useState(value || '');
  const [isOpen, setIsOpen]          = useState(false);
  const [highlightIdx, setHighlight] = useState(-1);
  const wrapperRef = useRef(null);

  // Deduplicate by group name, keeping the most recent record per name.
  const groupSuggestions = useMemo(() => {
    const q = inputValue.trim().toLowerCase();
    if (q.length < 2) return [];

    // Collect all matching records (not DTQ/handed-off)
    const matching = rows.filter(
      (r) => !r.isDTQ && !r.isHandedOff && r.groupName.toLowerCase().includes(q),
    );

    // Group by name → keep only most recent per unique name (by id desc)
    const byName = new Map();
    matching.forEach((r) => {
      if (!byName.has(r.groupName) || r.id > byName.get(r.groupName).id) {
        byName.set(r.groupName, r);
      }
    });

    return Array.from(byName.values())
      .slice(0, 6)
      .map((r) => {
        const sameTPA = currentTPA && r.tpa === currentTPA.code;
        const isDuplicate = !!currentTPA && sameTPA;
        return { ...r, isDuplicate };
      });
  }, [inputValue, rows, currentTPA]);

  // Keyboard-navigable list: all group suggestions + the create item
  const navigableCount = groupSuggestions.length + 1; // +1 for create

  function handleInput(e) {
    const v = e.target.value;
    setInputValue(v);
    onChange(v);
    setIsOpen(true);
    setHighlight(-1);
  }

  function handleSelectGroup(record) {
    setInputValue(record.groupName);
    onChange(record.groupName);
    onSelectRecord(record);
    setIsOpen(false);
  }

  function handleCreate() {
    onChange(inputValue);
    onSelectRecord(null);
    setIsOpen(false);
  }

  function handleKeyDown(e) {
    if (!isOpen) return;
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setHighlight((i) => Math.min(i + 1, navigableCount - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setHighlight((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && highlightIdx >= 0) {
      e.preventDefault();
      if (highlightIdx < groupSuggestions.length) {
        handleSelectGroup(groupSuggestions[highlightIdx]);
      } else {
        handleCreate();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }

  useEffect(() => {
    function onClickOutside(e) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setIsOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  const showDropdown = isOpen && inputValue.trim().length >= 2;

  return (
    <Box ref={wrapperRef} sx={{ position: 'relative' }}>
      <TextField
        fullWidth
        label="Group name *"
        size="small"
        value={inputValue}
        onChange={handleInput}
        onFocus={() => { if (inputValue.trim().length >= 2) setIsOpen(true); }}
        onKeyDown={handleKeyDown}
        autoComplete="off"
      />

      {showDropdown && (
        <Paper elevation={0} sx={{
          position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
          zIndex: 1400, border: `1px solid ${C.divider}`, borderRadius: '8px',
          maxHeight: 360, overflowY: 'auto',
          boxShadow: '0 4px 16px rgba(0,0,0,0.09)', bgcolor: '#fcfcfc',
        }}>

          {/* ── Level 1+2: Group name suggestions with nested intake card ── */}
          {groupSuggestions.map((record, idx) => {
            const isHighlighted = highlightIdx === idx;
            return (
              <Box
                key={record.id}
                onMouseDown={() => handleSelectGroup(record)}
                sx={{
                  borderBottom: `1px solid ${C.divider}`,
                  bgcolor: isHighlighted ? C.blueLightBg : 'transparent',
                  cursor: 'pointer',
                  '&:hover': { bgcolor: C.blueLightBg },
                  '&:last-of-type': { borderBottom: 'none' },
                }}>

                {/* Group name row */}
                <Stack direction="row" alignItems="center"
                  sx={{ px: '14px', pt: '10px', pb: '4px', gap: '8px' }}>
                  <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#222222', flex: 1, minWidth: 0 }} noWrap>
                    {record.groupName}
                  </Typography>

                  {/* Duplicate badge */}
                  {record.isDuplicate && (
                    <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flexShrink: 0 }}>
                      <Box component="span" sx={{
                        px: '7px', py: '2px', bgcolor: '#fff3e0', color: C.orange,
                        border: '1px solid #ffe0b2', borderRadius: '4px',
                        fontSize: '11px', fontWeight: 600, whiteSpace: 'nowrap',
                      }}>
                        Possible duplicate
                      </Box>
                      <Box
                        component="span"
                        onMouseDown={(e) => { e.stopPropagation(); navigate(`/rfp/${record.id}`); }}
                        sx={{
                          display: 'inline-flex', alignItems: 'center', gap: '2px',
                          fontSize: '11px', color: C.blueLight, cursor: 'pointer',
                          fontWeight: 500, whiteSpace: 'nowrap',
                          '&:hover': { textDecoration: 'underline' },
                        }}>
                        View <ArrowForwardIcon sx={{ fontSize: 10 }} />
                      </Box>
                    </Stack>
                  )}
                </Stack>

                {/* Intake card — Level 2 */}
                <Box sx={{
                  mx: '8px', mb: '8px',
                  bgcolor: '#f7f7f7',
                  borderRadius: '0 0 6px 6px',
                  px: '12px', pt: '6px', pb: '8px',
                }}>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: '3px' }}>
                    <Box component="span" sx={{
                      px: '8px', py: '2px',
                      bgcolor: C.blueLightBg, color: C.blue,
                      borderRadius: '4px', fontSize: '11px', fontWeight: 600,
                      flexShrink: 0,
                    }}>
                      {record.tpa}
                    </Box>
                    <Typography noWrap sx={{ fontSize: '12px', color: C.grayMid }}>
                      {record.producer || '—'}
                    </Typography>
                  </Stack>
                  <Typography sx={{ fontSize: '12px', color: C.grayMid }}>
                    Effective: {record.effectiveDate || '—'} · UW: {record.assignedUW}
                  </Typography>
                </Box>

              </Box>
            );
          })}

          {/* ── Create new group ── */}
          <Box
            onMouseDown={handleCreate}
            sx={{
              px: '14px', py: '10px', cursor: 'pointer',
              color: C.blueLight, fontSize: '14px', fontWeight: 500,
              bgcolor: highlightIdx === groupSuggestions.length ? C.blueLightBg : 'transparent',
              borderTop: groupSuggestions.length > 0 ? `1px solid ${C.divider}` : 'none',
              '&:hover': { bgcolor: C.blueLightBg },
            }}>
            + Create "{inputValue}" as new group
          </Box>

        </Paper>
      )}
    </Box>
  );
}

// ─── Right panel card wrapper ─────────────────────────────────────────────────

function PanelCard({ title, titleRight, children }) {
  return (
    <Paper elevation={0} sx={{ border: `1px solid ${C.divider}`, borderRadius: '8px', bgcolor: C.bgPaper, boxShadow: 'none', p: '20px' }}>
      <Stack direction="row" alignItems="center" justifyContent="space-between"
        sx={{ mb: '12px', pb: '10px', borderBottom: `1px solid ${C.divider}` }}>
        <Typography sx={{ fontSize: '11px', fontWeight: 500, color: C.grayMid, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {title}
        </Typography>
        {titleRight}
      </Stack>
      {children}
    </Paper>
  );
}

// ═════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═════════════════════════════════════════════════════════════════════════════

export default function NewRFP() {
  const navigate = useNavigate();
  const { rows, addRow } = useQuoteLog();

  // ── Section 1: Group identity
  const [groupName, setGroupName]             = useState('');
  const [selectedRecord, setSelectedRecord]   = useState(null);
  const [renewalOn, setRenewalOn]             = useState(false);
  const [prefillBannerDismissed, setPrefillBannerDismissed] = useState(false);
  const [prefillApplied, setPrefillApplied]   = useState(false);

  // ── Section 2: TPA & Coverage
  const [tpa, setTpa]                         = useState(null);
  const [carrier, setCarrier]                 = useState('');
  const [impSpec, setImpSpec]                 = useState('');
  const [autoUW, setAutoUW]                   = useState('');
  const [isEHRC, setIsEHRC]                   = useState(null);
  const [editCarrier, setEditCarrier]         = useState(false);
  const [editIS, setEditIS]                   = useState(false);
  const [autoFillFlash, setAutoFillFlash]     = useState(false);

  // ── Section 3: Producer & Contact
  const [producer, setProducer]               = useState('');
  const [contact, setContact]                 = useState('');

  // ── Section 4: Location & Industry
  const [zipCode, setZipCode]                 = useState('');
  const [derivedState, setDerivedState]       = useState('');
  const [stateBlocked, setStateBlocked]       = useState(false);
  const [sicCode, setSicCode]                 = useState('');
  const [sicInfo, setSicInfo]                 = useState(null);
  const [isDTQ, setIsDTQ]                     = useState(false);
  const [showDTQModal, setShowDTQModal]       = useState(false);
  const [dtqOverride, setDtqOverride]         = useState(false);
  const [overrideReason, setOverrideReason]   = useState('');

  // ── Section 5: Dates & Urgency
  const [effectiveDate, setEffectiveDate]     = useState(null);
  const [receivedDate, setReceivedDate]       = useState(TODAY);
  const [tpacDate, setTpacDate]               = useState(null);
  const [isRush, setIsRush]                   = useState(false);

  // ── Section 6: Underwriter
  const [underwriter, setUnderwriter]         = useState('');
  const [uwChangeFrom, setUwChangeFrom]       = useState('');
  const [excludeUW, setExcludeUW]             = useState(false);
  const [uwBannerDismissed, setUwBannerDismissed] = useState(false);

  // ── UI
  const [showConfirm, setShowConfirm]         = useState(false);

  // ── Derived ────────────────────────────────────────────────────────────────

  const requestDate = useMemo(() => {
    if (!receivedDate) return null;
    return addBusinessDays(receivedDate, isRush ? 1 : 3);
  }, [receivedDate, isRush]);

  const shortLeadTime = useMemo(() => {
    if (!effectiveDate) return false;
    const days = differenceInCalendarDays(effectiveDate, TODAY);
    return days >= 0 && days < 30;
  }, [effectiveDate]);

  const possibleRenewal = useMemo(() => {
    if (!groupName || groupName.length < 3 || prefillBannerDismissed) return null;
    return rows.find((r) => r.type === 'RENEWAL' && fuzzy(groupName, r.groupName)) ?? null;
  }, [groupName, rows, prefillBannerDismissed]);

  const showUWBanner = !!uwChangeFrom && underwriter !== autoUW && !uwBannerDismissed;

  const activeWarnings = useMemo(() => [
    stateBlocked  && { id: 'state', label: `${derivedState} not quotable`, variant: 'error' },
    isDTQ         && { id: 'dtq',   label: 'Case marked DTQ',              variant: 'error' },
    (isEHRC===true)&& { id: 'ehrc', label: 'EHRC: documentation required', variant: 'warning' },
    shortLeadTime && { id: 'lead',  label: 'Short lead time',              variant: 'warning' },
  ].filter(Boolean), [stateBlocked, derivedState, isDTQ, isEHRC, shortLeadTime]);

  const requiredFields = {
    'Group name':     !!groupName,
    'TPA':            !!tpa,
    'Carrier':        !!carrier,
    'Zip code':       zipCode.length >= 3,
    'SIC code':       sicCode.length === 4 && !isDTQ && (!dtqOverride || !!overrideReason),
    'Effective date': !!effectiveDate,
    'Received date':  !!receivedDate,
    'Underwriter':    !!underwriter,
  };
  const filledCount = Object.values(requiredFields).filter(Boolean).length;
  const canSave = filledCount === 8 && !stateBlocked;

  // Progressive locks
  const s2locked = !groupName;
  const s3locked = !tpa;
  const s4locked = !tpa;
  const s5locked = !tpa;
  const s6locked = !tpa;

  // ── Handlers ──────────────────────────────────────────────────────────────

  function handleTpaSelect(_, newVal) {
    setTpa(newVal);
    if (newVal) {
      setCarrier(newVal.carrier);
      setImpSpec(newVal.is);
      setAutoUW(newVal.uw);
      setUnderwriter(newVal.uw);
      setUwChangeFrom('');
      setExcludeUW(false);
      setUwBannerDismissed(false);
      setAutoFillFlash(true);
      setTimeout(() => setAutoFillFlash(false), 2500);
    } else {
      setCarrier(''); setImpSpec(''); setAutoUW(''); setUnderwriter('');
    }
  }

  function handleZipBlur() {
    const prefix = zipCode.slice(0, 3);
    const st = ZIP_MAP[prefix] ?? '';
    setDerivedState(st);
    setStateBlocked(NON_QUOTABLE.includes(st));
  }

  function handleSicBlur() {
    if (sicCode.length !== 4) return;
    const info = SIC_MAP[sicCode] ?? null;
    setSicInfo(info);
    if (FORBIDDEN_SIC.includes(sicCode) && !dtqOverride) setShowDTQModal(true);
  }

  function handleMarkDTQ() {
    setIsDTQ(true);
    setShowDTQModal(false);
    setDtqOverride(false);
  }

  function handleDTQOverride() {
    setDtqOverride(true);
    setShowDTQModal(false);
  }

  function handleUWChange(newVal) {
    if (newVal === autoUW) {
      setUwChangeFrom('');
      setExcludeUW(false);
      setUwBannerDismissed(false);
    } else {
      setUwChangeFrom(underwriter !== autoUW ? underwriter : autoUW);
      setExcludeUW(false);
      setUwBannerDismissed(false);
    }
    setUnderwriter(newVal);
  }

  function applyPrefill(record) {
    const tpaData = TPA_MAP[record.tpa];
    if (tpaData) {
      setTpa(tpaData);
      setCarrier(tpaData.carrier);
      setImpSpec(tpaData.is);
      setAutoUW(tpaData.uw);
      setUnderwriter(tpaData.uw);
    }
    if (record.zipCode) setZipCode(record.zipCode);
    setRenewalOn(true);
    setPrefillApplied(true);
    setPrefillBannerDismissed(true);
  }

  function handleGroupNameSelect(record) {
    setSelectedRecord(record);
    if (record && record.badge === 'different-tpa') {
      applyPrefill(record);
    }
  }

  function handleSave() {
    if (!canSave) return;
    addRow({
      groupName,
      type:         renewalOn ? 'RENEWAL' : 'NEW',
      tpa:          tpa?.code ?? '',
      producer:     producer,
      effectiveDate: effectiveDate ? format(effectiveDate, 'MMM d, yyyy') : '—',
      assignedUW:   tpa?.uwInitials ?? 'SR',
      requestDate:  format(receivedDate, 'yyyy-MM-dd'),
      deadline:     requestDate ? format(requestDate, 'yyyy-MM-dd') : format(receivedDate, 'yyyy-MM-dd'),
      censusStatus: 'Census Received',
      sob: '—', risk: '—', setup: '—',
      isRush,
    });
    navigate('/');
  }

  // ─────────────────────────────────────────────────────────────────────────

  return (
    <Box sx={{ pb: 6 }}>

      {/* ── Sticky page header ── */}
      <Stack direction="row" alignItems="center" justifyContent="space-between"
        sx={{
          position: 'sticky', top: 0, zIndex: 100,
          bgcolor: '#f7f7f7', borderBottom: `1px solid ${C.divider}`,
          height: 56, mx: -4, px: 4, mb: '28px',
        }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Typography sx={{ fontSize: '20px', fontWeight: 600, color: C.black, lineHeight: 1 }}>
            New RFP
          </Typography>
          {renewalOn && (
            <Box component="span" sx={{
              display: 'inline-flex', alignItems: 'center',
              px: '10px', py: '3px', fontSize: '12px', fontWeight: 500,
              borderRadius: '20px', bgcolor: '#f0f7ec', color: C.green,
              border: '1px solid #c8e6b0',
            }}>
              Renewal
            </Box>
          )}
          {isRush && (
            <Box component="span" sx={{
              px: '8px', py: '2px', borderRadius: '4px',
              border: '1px solid #ffe0b2', bgcolor: '#fff3e0',
              fontSize: '11px', fontWeight: 600, color: C.orange,
            }}>
              Rush
            </Box>
          )}
        </Stack>
        <Stack direction="row" spacing={1.5}>
          <Button
            variant="outlined" onClick={() => navigate('/')}
            sx={{
              height: 36, px: 2, fontSize: '13px', fontWeight: 500,
              borderColor: C.divider, color: '#28313e', borderRadius: '6px',
              bgcolor: 'transparent',
              '&:hover': { borderColor: C.darkGray, bgcolor: 'transparent' },
            }}>
            Cancel
          </Button>
          <Button
            variant="contained" disabled={!canSave} onClick={() => setShowConfirm(true)}
            sx={{
              height: 36, px: 2, fontSize: '13px', fontWeight: 500,
              borderRadius: '6px', minWidth: 112,
              bgcolor: canSave ? C.blueLight : '#c0c0c0',
              boxShadow: 'none',
              '&:hover': { boxShadow: 'none', bgcolor: canSave ? '#0e57a0' : '#c0c0c0' },
              '&.Mui-disabled': { bgcolor: '#c0c0c0', color: '#fff' },
            }}>
            Save RFP
          </Button>
        </Stack>
      </Stack>

      {/* Two-column layout */}
      <Box sx={{ display: 'flex', gap: '24px', alignItems: 'flex-start' }}>

        {/* ══════════════════════════════════════════════════════════════════
            LEFT — form sections
        ══════════════════════════════════════════════════════════════════ */}
        <Box sx={{ flex: 1, minWidth: 0, maxWidth: 720, display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* ── S1: Group Identity ── */}
          <SectionCard title="Group identity">
            <Stack spacing={2}>

              {/* Group name autocomplete */}
              <GroupNameDropdown
                value={groupName}
                onChange={setGroupName}
                onSelectRecord={handleGroupNameSelect}
                rows={rows}
                currentTPA={tpa}
                navigate={navigate}
              />

              {/* Renewal detection banner */}
              {possibleRenewal && !prefillApplied && (
                <InlineBanner variant="info" onClose={() => setPrefillBannerDismissed(true)}>
                  <span>
                    Possible renewal found — <strong>{possibleRenewal.groupName}</strong>, {possibleRenewal.effectiveDate}, UW: {possibleRenewal.assignedUW}.{' '}
                    <Typography component="span" onClick={() => applyPrefill(possibleRenewal)}
                      sx={{ fontSize: '13px', color: C.blueLight, cursor: 'pointer', fontWeight: 500, '&:hover': { textDecoration: 'underline' } }}>
                      Prefill last year's data
                    </Typography>
                    {' · '}
                    <Typography component="span" onClick={() => setPrefillBannerDismissed(true)}
                      sx={{ fontSize: '13px', color: C.grayMid, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}>
                      Start fresh
                    </Typography>
                  </span>
                </InlineBanner>
              )}
              {prefillApplied && (
                <InlineBanner variant="success">
                  Prior year data loaded. Review and confirm each field.
                </InlineBanner>
              )}

              {/* Renewal toggle */}
              <Stack direction="row" alignItems="center" justifyContent="space-between">
                <Box>
                  <Typography sx={{ fontSize: '14px', fontWeight: 500, color: C.black }}>Renewal</Typography>
                  <Typography sx={{ fontSize: '12px', color: C.grayMid, mt: 0.25 }}>Toggle on if this replaces an existing group</Typography>
                </Box>
                <Switch checked={renewalOn} onChange={(e) => setRenewalOn(e.target.checked)} />
              </Stack>

              {/* Prior year data card */}
              <Collapse in={renewalOn} unmountOnExit>
                <Box sx={{ p: '14px 16px', bgcolor: '#e1eaf7', border: `1px solid #b5d4f4`, borderRadius: '6px' }}>
                  <Stack direction="row" alignItems="center" spacing={1} mb={1.5}>
                    <Typography sx={{ fontSize: '12px', fontWeight: 600, color: C.blue }}>Prior year data</Typography>
                    {prefillApplied && selectedRecord && (
                      <Chip label={`From ${selectedRecord.effectiveDate || '2025'}`} size="small"
                        sx={{ height: 18, fontSize: '10px', borderRadius: '10px', bgcolor: C.blueLight, color: '#fff', '& .MuiChip-label': { px: 0.75 } }} />
                    )}
                  </Stack>
                  <Grid container spacing={1.5}>
                    {[
                      ['Census',      selectedRecord?.censusStatus || '—'],
                      ['Carrier',     selectedRecord ? TPA_MAP[selectedRecord.tpa]?.carrier : '—'],
                      ['Effective',   selectedRecord?.effectiveDate || '—'],
                      ['Prior UW',    selectedRecord?.assignedUW || '—'],
                      ['SoB',         selectedRecord?.sob || '—'],
                      ['Rate action', '—'],
                    ].map(([lbl, val]) => (
                      <Grid item xs={4} key={lbl}>
                        <Typography sx={{ fontSize: '11px', color: C.blue, mb: 0.25 }}>{lbl}</Typography>
                        <Typography sx={{ fontSize: '13px', fontWeight: 500, color: '#0a1a3a' }}>{val}</Typography>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              </Collapse>

            </Stack>
          </SectionCard>

          {/* ── S2: TPA & Coverage ── */}
          <SectionCard title="TPA & Coverage" locked={s2locked} lockedHint="Enter a group name first">
            <Stack spacing={2}>

              <Autocomplete options={TPA_OPTIONS} getOptionLabel={(o) => (typeof o === 'string' ? o : o.label)}
                isOptionEqualToValue={(o, v) => o.code === v.code}
                value={tpa} onChange={handleTpaSelect}
                renderInput={(params) => (
                  <TextField {...params} label="TPA *" size="small" placeholder="CCAE, ASR, IMS…"
                    sx={{ '& .MuiOutlinedInput-root': { transition: 'box-shadow 0.3s', ...(autoFillFlash && { boxShadow: `0 0 0 3px rgba(17,102,187,0.18)` }) } }} />
                )}
                renderOption={(props, opt) => (
                  <li {...props} key={opt.code}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box component="span" sx={{ px: 1, py: 0.25, bgcolor: C.blueLightBg, color: C.blue, borderRadius: '4px', fontSize: '11px', fontWeight: 700, fontFamily: 'monospace' }}>{opt.code}</Box>
                      <Typography sx={{ fontSize: '13px' }}>{opt.label.split('—')[1]?.trim()}</Typography>
                    </Stack>
                  </li>
                )}
              />

              {tpa && (
                <Stack spacing={2}>
                  {/* Carrier */}
                  {editCarrier ? (
                    <FormControl fullWidth size="small">
                      <InputLabel>Carrier</InputLabel>
                      <Select value={carrier} label="Carrier" onChange={(e) => setCarrier(e.target.value)} autoFocus onBlur={() => setEditCarrier(false)}>
                        {['Pan American', 'Aetna', 'BCBS', 'TMHCC/Berkshire', 'ATA/AIC'].map((c) => (
                          <MenuItem key={c} value={c} sx={{ fontSize: '14px' }}>{c}</MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  ) : (
                    <AutoFilledField label="Carrier" value={carrier} onEdit={() => setEditCarrier(true)} flash={autoFillFlash} />
                  )}

                  {/* IS */}
                  {editIS ? (
                    <TextField label="Implementation specialist" size="small" fullWidth value={impSpec}
                      onChange={(e) => setImpSpec(e.target.value)} autoFocus onBlur={() => setEditIS(false)} />
                  ) : (
                    <AutoFilledField label="Implementation specialist" value={impSpec} onEdit={() => setEditIS(true)} flash={autoFillFlash} />
                  )}

                  {/* Default UW (read-only info in section 2) */}
                  <AutoFilledField label="Default underwriter" value={autoUW} onEdit={() => {}} flash={autoFillFlash} />
                </Stack>
              )}

              {/* EHRC */}
              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 500, color: '#28313e', mb: '8px' }}>Is this an EHRC case?</Typography>
                <SegmentedYesNo value={isEHRC} onChange={setIsEHRC} />
                <Collapse in={isEHRC === true} unmountOnExit>
                  <InlineBanner variant="warning">
                    <strong>EHRC case</strong> — additional documentation required. Compliance team will be notified on save.
                  </InlineBanner>
                </Collapse>
              </Box>

            </Stack>
          </SectionCard>

          {/* ── S3: Producer & Contact ── */}
          <SectionCard title="Producer & Contact" locked={s3locked} lockedHint="Select a TPA first">
            <Stack spacing={2}>
              <Autocomplete
                options={[...PRODUCER_OPTIONS, { agency: '__add__', contact: '' }]}
                getOptionLabel={(o) => (typeof o === 'string' ? o : o.agency === '__add__' ? '' : `${o.agency} — ${o.contact}`)}
                value={PRODUCER_OPTIONS.find((p) => p.agency === producer) ?? null}
                onChange={(_, v) => {
                  if (!v) { setProducer(''); setContact(''); return; }
                  if (v.agency === '__add__') return;
                  setProducer(v.agency);
                  setContact(v.contact);
                }}
                renderInput={(params) => <TextField {...params} label="Producer" size="small" placeholder="Agency name or producer" />}
                renderOption={(props, opt) => {
                  if (opt.agency === '__add__') {
                    return (
                      <li {...props} key="add" onClick={() => alert('New producer request noted. Contact admin to add.')}>
                        <Typography sx={{ fontSize: '14px', color: C.blueLight, fontWeight: 500 }}>+ Add new producer</Typography>
                      </li>
                    );
                  }
                  return (
                    <li {...props} key={opt.agency}>
                      <Stack>
                        <Typography sx={{ fontSize: '13px', fontWeight: 500 }}>{opt.agency}</Typography>
                        <Typography sx={{ fontSize: '12px', color: C.grayMid }}>{opt.contact}</Typography>
                      </Stack>
                    </li>
                  );
                }}
              />
              <TextField label="Contact name (optional)" size="small" fullWidth value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="e.g. John Smith, Benefits Coordinator" />
            </Stack>
          </SectionCard>

          {/* ── S4: Location & Industry ── */}
          <SectionCard title="Location & Industry" locked={s4locked} lockedHint="Select a TPA first">
            <Stack spacing={2}>

              {/* ZIP + derived state */}
              <Box>
                <Stack direction="row" spacing={1.5} alignItems="flex-start">
                  <TextField label="ZIP code (3-digit) *" size="small" value={zipCode}
                    onChange={(e) => setZipCode(e.target.value.replace(/\D/g, '').slice(0, 3))}
                    onBlur={handleZipBlur} inputProps={{ maxLength: 3 }} sx={{ width: 180 }} />
                  {derivedState && (
                    <Box sx={{ height: 40, px: '12px', border: `1px solid ${C.divider}`, borderRadius: '6px', bgcolor: '#f1f1f1', display: 'flex', alignItems: 'center', mt: '0px' }}>
                      <Typography sx={{ fontSize: '14px', fontWeight: 500, color: '#28313e' }}>{derivedState}</Typography>
                    </Box>
                  )}
                </Stack>
                {stateBlocked && <InlineBanner variant="error">{derivedState} is not currently quotable. This case may need to be declined.</InlineBanner>}
              </Box>

              {/* SIC code */}
              <Box>
                <TextField label="SIC code *" size="small" value={sicCode}
                  onChange={(e) => { setSicCode(e.target.value.replace(/\D/g, '').slice(0, 4)); setSicInfo(null); setDtqOverride(false); setIsDTQ(false); }}
                  onBlur={handleSicBlur} inputProps={{ maxLength: 4 }} sx={{ width: 180 }} error={isDTQ} />
                {sicInfo && !isDTQ && (
                  <Typography sx={{ fontSize: '12px', color: C.grayMid, mt: 0.75 }}>
                    <strong style={{ color: C.black }}>{sicCode}</strong> — {sicInfo.desc} · {sicInfo.cat}
                  </Typography>
                )}
                {isDTQ && <InlineBanner variant="error">This case is marked DTQ.</InlineBanner>}
                {dtqOverride && !isDTQ && (
                  <Box sx={{ mt: 1.5 }}>
                    <TextField label="Reason for override (required)" size="small" fullWidth value={overrideReason}
                      onChange={(e) => setOverrideReason(e.target.value)} error={dtqOverride && !overrideReason} />
                  </Box>
                )}
              </Box>
            </Stack>
          </SectionCard>

          {/* ── S5: Dates & Urgency ── */}
          <SectionCard title="Dates & urgency" locked={s5locked} lockedHint="Select a TPA first">
            <Stack spacing={2}>
              <Grid container spacing={2} alignItems="flex-start">
                {/* Effective date */}
                <Grid item xs={12} sm={4}>
                  <DatePicker label="Effective date *" value={effectiveDate} onChange={setEffectiveDate}
                    slotProps={{ textField: { size: 'small', fullWidth: true, error: !effectiveDate, helperText: !effectiveDate ? 'Required' : '' } }} />
                  {shortLeadTime && (
                    <Box sx={{ mt: 0.75 }}>
                      <InlineBanner variant="warning">
                        Short lead time.{' '}
                        <Typography component="span" onClick={() => setIsRush(true)}
                          sx={{ fontSize: '13px', color: C.blueLight, cursor: 'pointer', fontWeight: 500, '&:hover': { textDecoration: 'underline' } }}>
                          Enable Rush →
                        </Typography>
                      </InlineBanner>
                    </Box>
                  )}
                </Grid>
                {/* Received date */}
                <Grid item xs={12} sm={4}>
                  <Box sx={{ position: 'relative' }}>
                    <DatePicker label="Received date *" value={receivedDate} onChange={setReceivedDate}
                      slotProps={{ textField: { size: 'small', fullWidth: true } }} />
                    <Chip label="Today" size="small" clickable onClick={() => setReceivedDate(TODAY)}
                      sx={{ position: 'absolute', right: 36, top: '50%', transform: 'translateY(-50%)', height: 20, fontSize: '10px', bgcolor: C.blueLightBg, color: C.blueLight, '& .MuiChip-label': { px: 0.75 } }} />
                  </Box>
                </Grid>
                {/* TPAC date — only for renewals */}
                <Collapse in={renewalOn} unmountOnExit component={Grid} item xs={12} sm={4}>
                  <DatePicker label="TPAC date" value={tpacDate} onChange={setTpacDate}
                    slotProps={{ textField: { size: 'small', fullWidth: true, placeholder: 'Optional for renewals' } }} />
                </Collapse>
              </Grid>

              {/* Rush toggle */}
              <Stack direction="row" alignItems="center" justifyContent="space-between"
                sx={{ p: '12px 16px', borderRadius: '6px', border: '1px solid', borderColor: isRush ? '#ffe0b2' : C.divider, bgcolor: isRush ? '#fffdf8' : 'transparent', transition: 'all 0.2s' }}>
                <Box>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography sx={{ fontSize: '14px', fontWeight: 500, color: isRush ? C.orange : C.black }}>Rush</Typography>
                    {isRush && (
                      <Box component="span"
                        sx={{ px: 0.75, py: 0.2, borderRadius: '4px', border: '1px solid #ffe0b2', bgcolor: '#fff3e0', fontSize: '11px', fontWeight: 600, color: C.orange }}>
                        Rush case
                      </Box>
                    )}
                  </Stack>
                  <Typography sx={{ fontSize: '12px', color: C.grayMid, mt: 0.25 }}>
                    {isRush ? 'Due date recalculates to 1 business day.' : 'Prioritized in UW queue'}
                  </Typography>
                </Box>
                <Switch checked={isRush} onChange={(e) => setIsRush(e.target.checked)}
                  sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: C.orange }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: C.orange } }} />
              </Stack>

              {/* Request date — read-only */}
              <Box>
                <Typography sx={{ fontSize: '13px', fontWeight: 500, color: '#28313e', mb: '6px' }}>Request date</Typography>
                <Stack direction="row" alignItems="center" spacing={1.5}
                  sx={{ height: 40, borderRadius: '6px', border: `1px solid ${C.divider}`, bgcolor: '#f1f1f1', px: 1.5 }}>
                  <LockOutlinedIcon sx={{ fontSize: 14, color: C.grayMid }} />
                  <Typography sx={{ fontSize: '14px', fontWeight: 600, color: '#28313e', flex: 1 }}>
                    {requestDate ? format(requestDate, 'MMM d, yyyy') : '—'}
                  </Typography>
                  {isRush && (
                    <Box component="span"
                      sx={{ px: 0.75, py: 0.2, borderRadius: '4px', border: '1px solid #ffe0b2', bgcolor: '#fff3e0', fontSize: '10px', fontWeight: 600, color: C.orange }}>
                      Rush
                    </Box>
                  )}
                </Stack>
                <Typography sx={{ fontSize: '12px', color: C.grayMid, mt: '4px' }}>
                  Auto-calculated · SLA: {isRush ? '1 business day' : '3 business days'}
                </Typography>
              </Box>
            </Stack>
          </SectionCard>

          {/* ── S6: Underwriter Assignment ── */}
          <SectionCard title="Underwriter assignment" locked={s6locked} lockedHint="Select a TPA first">
            <Stack spacing={2}>
              <FormControl fullWidth size="small">
                <InputLabel>Underwriter *</InputLabel>
                <Select value={underwriter} label="Underwriter *" onChange={(e) => handleUWChange(e.target.value)}>
                  {UW_OPTIONS.map((u) => <MenuItem key={u} value={u} sx={{ fontSize: '14px' }}>{u}</MenuItem>)}
                </Select>
              </FormControl>

              {showUWBanner && (
                <Box sx={{ p: '12px 16px', bgcolor: '#fff8f3', borderLeft: `3px solid ${C.orange}`, borderRadius: '6px' }}>
                  <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
                    <Box>
                      <Typography sx={{ fontSize: '13px', color: '#28313e', mb: 0.75 }}>
                        You changed the underwriter from <strong>{uwChangeFrom}</strong> to <strong>{underwriter}</strong>.
                      </Typography>
                      <FormControlLabel
                        control={<Switch size="small" checked={excludeUW} onChange={(e) => setExcludeUW(e.target.checked)}
                          sx={{ '& .MuiSwitch-switchBase.Mui-checked': { color: C.orange }, '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': { bgcolor: C.orange } }} />}
                        label={<Typography sx={{ fontSize: '12px', color: C.grayMid }}>Exclude <strong>{uwChangeFrom}</strong> from auto-assignment for {tpa?.code}</Typography>}
                      />
                    </Box>
                    <IconButton size="small" onClick={() => setUwBannerDismissed(true)} sx={{ p: 0.25, color: C.grayMid, ml: 1, flexShrink: 0 }}>
                      <CloseIcon sx={{ fontSize: 14 }} />
                    </IconButton>
                  </Stack>
                </Box>
              )}
            </Stack>
          </SectionCard>

        </Box>

        {/* ══════════════════════════════════════════════════════════════════
            RIGHT — co-pilot panel (sticky 300px)
        ══════════════════════════════════════════════════════════════════ */}
        <Box sx={{ width: 280, flexShrink: 0, position: 'sticky', top: 84, alignSelf: 'flex-start', display: 'flex', flexDirection: 'column', gap: '16px' }}>

          {/* TPA Summary */}
          {tpa ? (
            <PanelCard title="TPA summary"
              titleRight={
                <Box component="span" sx={{ px: 1, py: 0.25, bgcolor: autoFillFlash ? C.blueLight : C.blueLightBg, color: autoFillFlash ? '#fff' : C.blueLight, borderRadius: '4px', fontSize: '11px', fontWeight: 600, transition: 'all 0.4s' }}>
                  {autoFillFlash ? 'Auto-populated' : 'Populated'}
                </Box>
              }>
              <Typography sx={{ fontFamily: 'monospace', fontWeight: 700, fontSize: '18px', color: C.blue, mb: 1.5 }}>
                {tpa.code}
              </Typography>
              {[{ lbl: 'Carrier', val: carrier }, { lbl: 'IS', val: impSpec }, { lbl: 'UW', val: autoUW }].map(({ lbl, val }) => (
                <Stack key={lbl} direction="row" alignItems="center" justifyContent="space-between" sx={{ py: 0.625, borderBottom: `1px solid ${C.divider}` }}>
                  <Typography sx={{ fontSize: '12px', color: C.grayMid, width: 56 }}>{lbl}</Typography>
                  <Typography sx={{ fontSize: '13px', fontWeight: 500, flexGrow: 1, color: C.black }}>{val || '—'}</Typography>
                  {val && <CheckCircleIcon sx={{ fontSize: 14, color: autoFillFlash ? C.green : '#a8d5b5', transition: 'color 0.4s' }} />}
                </Stack>
              ))}
              {tpa.notes && (
                <Stack direction="row" spacing={0.75} sx={{ mt: 1.5, bgcolor: C.bgPage, borderRadius: 1, p: '8px 10px' }}>
                  <InfoOutlinedIcon sx={{ fontSize: 14, color: C.grayMid, mt: '1px', flexShrink: 0 }} />
                  <Typography sx={{ fontSize: '11px', color: C.grayMid, lineHeight: 1.5 }}>
                    {isEHRC === true ? 'EHRC case — additional documentation required.' : isDTQ ? 'Marked DTQ — this case cannot be quoted.' : tpa.notes}
                  </Typography>
                </Stack>
              )}
            </PanelCard>
          ) : (
            <Paper elevation={0} sx={{ border: `1px dashed ${C.divider}`, borderRadius: 2, p: 3, textAlign: 'center', bgcolor: C.bgPaper }}>
              <Typography sx={{ fontSize: '13px', color: C.grayMid }}>Select a TPA to see details</Typography>
            </Paper>
          )}

          {/* Request Date */}
          {receivedDate && (
            <PanelCard title="Request date">
              {[
                { lbl: 'Received', val: format(receivedDate, 'MMM d, yyyy') },
                { lbl: 'Rush',     val: isRush ? 'Yes' : 'No' },
                { lbl: 'SLA',      val: isRush ? '1 business day' : '3 business days' },
              ].map(({ lbl, val }) => (
                <Stack key={lbl} direction="row" justifyContent="space-between" sx={{ py: 0.55 }}>
                  <Typography sx={{ fontSize: '12px', color: C.grayMid }}>{lbl}</Typography>
                  <Typography sx={{ fontSize: '12px', fontWeight: 500, color: isRush && lbl === 'Rush' ? C.orange : C.black }}>{val}</Typography>
                </Stack>
              ))}
              <Divider sx={{ my: 1 }} />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography sx={{ fontSize: '13px', fontWeight: 600, color: C.black }}>Due by</Typography>
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Typography sx={{ fontSize: '15px', fontWeight: 700, color: isRush ? C.orange : C.green }}>
                    {requestDate ? format(requestDate, 'MMM d, yyyy') : '—'}
                  </Typography>
                  {isRush && (
                    <Box component="span" sx={{ px: 0.75, py: 0.2, borderRadius: '4px', border: '1px solid #ffe0b2', bgcolor: '#fff3e0', fontSize: '10px', fontWeight: 700, color: C.orange }}>Rush</Box>
                  )}
                </Stack>
              </Stack>
            </PanelCard>
          )}

          {/* Active warnings */}
          {activeWarnings.length > 0 && (
            <PanelCard title="Active warnings" titleRight={
              <Box component="span" sx={{ width: 18, height: 18, borderRadius: '50%', bgcolor: C.orange, color: '#fff', fontSize: '10px', fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {activeWarnings.length}
              </Box>
            }>
              <Stack spacing={0.75}>
                {activeWarnings.map((w) => {
                  const colors = { error: { bg: '#fdecea', color: C.red }, warning: { bg: '#fff3e0', color: C.orange } };
                  const sc = colors[w.variant] || colors.warning;
                  return (
                    <Box key={w.id} sx={{ display: 'inline-flex', px: 1, py: 0.35, bgcolor: sc.bg, color: sc.color, borderRadius: '4px', fontSize: '11px', fontWeight: 500 }}>
                      {w.label}
                    </Box>
                  );
                })}
              </Stack>
            </PanelCard>
          )}

          {/* Required fields checklist */}
          <PanelCard title="Required fields"
            titleRight={
              <Typography sx={{ fontSize: '12px', fontWeight: 600, color: filledCount === 8 ? C.green : C.blueLight }}>
                {filledCount} / 8
              </Typography>
            }>
            {Object.entries(requiredFields).map(([lbl, done]) => (
              <ChecklistItem key={lbl} label={lbl} done={done} />
            ))}
          </PanelCard>

          {/* Pre-save confirmation drawer */}
          <Collapse in={showConfirm} unmountOnExit>
            <Paper elevation={0} sx={{ border: `1px solid ${C.divider}`, borderRadius: 2, p: '16px 20px', bgcolor: C.bgPaper }}>
              <Typography sx={{ fontSize: '14px', fontWeight: 600, color: C.black, mb: 1 }}>Ready to save?</Typography>
              <Stack spacing={0.5} mb={1.75}>
                <Typography sx={{ fontSize: '13px', color: C.black, fontWeight: 500 }}>{groupName}</Typography>
                <Typography sx={{ fontSize: '12px', color: C.grayMid }}>
                  {renewalOn ? 'Renewal' : 'New'} · {tpa?.code} · {carrier} · {underwriter}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={1} mt={0.5}>
                  {isRush && (
                    <Box component="span" sx={{ px: 0.75, py: 0.2, borderRadius: '4px', border: '1px solid #ffe0b2', bgcolor: '#fff3e0', fontSize: '11px', fontWeight: 600, color: C.orange }}>Rush</Box>
                  )}
                  {requestDate && (
                    <Typography sx={{ fontSize: '12px', color: C.grayMid }}>Due {format(requestDate, 'MMM d, yyyy')}</Typography>
                  )}
                </Stack>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" size="small" onClick={() => setShowConfirm(false)} sx={{ flex: 1, height: 36 }}>Cancel</Button>
                <Button variant="contained" size="small" onClick={handleSave} sx={{ flex: 2, height: 36, bgcolor: C.blueLight }}>
                  Confirm & Save RFP
                </Button>
              </Stack>
            </Paper>
          </Collapse>


        </Box>
      </Box>

      {/* ── DTQ Modal ── */}
      <Dialog open={showDTQModal} onClose={() => setShowDTQModal(false)} maxWidth="xs" fullWidth
        PaperProps={{ sx: { borderRadius: 2, border: `1px solid ${C.divider}` } }}>
        <DialogTitle sx={{ fontSize: '16px', fontWeight: 600, color: C.black, pb: 1 }}>
          SIC {sicCode} not eligible for quoting
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontSize: '14px', color: C.grayMid, lineHeight: 1.6 }}>
            This industry code cannot be quoted under standard guidelines. Would you like to mark this case as DTQ, or override and continue with a reason?
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2.5, gap: 1 }}>
          <Button variant="outlined" onClick={handleDTQOverride} sx={{ borderColor: C.divider, color: C.black }}>
            Override & continue
          </Button>
          <Button variant="contained" onClick={handleMarkDTQ}
            sx={{ bgcolor: C.red, '&:hover': { bgcolor: '#a01010' } }}>
            Mark DTQ
          </Button>
        </DialogActions>
      </Dialog>

    </Box>
  );
}
