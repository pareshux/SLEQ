import { useMemo, useState } from 'react';
import {
  Box, Stack, Typography, Paper, Button, Avatar,
  Divider, Tooltip,
} from '@mui/material';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import FlagIcon from '@mui/icons-material/Flag';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { differenceInCalendarDays, parseISO, format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { C, statusChipStyles } from '../theme/theme';
import { STATUS_STYLES, useQuoteLog } from '../context/QuoteLogStore';

// ─── Constants ────────────────────────────────────────────────────────────────

const TODAY = parseISO('2026-04-21');

const UW_META = {
  SR: { name: 'Steve Rogers',  tpa: 'CCAE', color: C.blue,     bg: C.blueLightBg },
  JM: { name: 'Jason M.',      tpa: 'ASR',  color: '#2e7d32',  bg: '#e8f5e9'     },
  VC: { name: 'Vicki C.',      tpa: 'IMS',  color: '#5e35b1',  bg: '#ede7f6'     },
};

// ─── Stat card ────────────────────────────────────────────────────────────────

function StatCard({ label, value, sub, accent }) {
  return (
    <Paper elevation={0} sx={{ border: `1px solid ${C.divider}`, borderRadius: '8px', p: '20px', bgcolor: C.bgPaper, boxShadow: 'none', flex: 1 }}>
      <Typography sx={{ fontSize: '11px', fontWeight: 500, color: C.grayMid, textTransform: 'uppercase', letterSpacing: '0.06em', mb: '10px' }}>
        {label}
      </Typography>
      <Typography sx={{ fontSize: '28px', fontWeight: 700, color: accent || C.black, lineHeight: 1, mb: '4px' }}>
        {value}
      </Typography>
      {sub && (
        <Typography sx={{ fontSize: '13px', color: C.grayMid }}>{sub}</Typography>
      )}
    </Paper>
  );
}

// ─── Status pill (mini) ───────────────────────────────────────────────────────

function StatusPill({ value }) {
  if (!value || value === '—') return <Typography sx={{ fontSize: '12px', color: C.grayMid }}>—</Typography>;
  const s = STATUS_STYLES[value];
  if (!s) return <Typography sx={{ fontSize: '12px', color: C.grayMid }}>—</Typography>;
  return (
    <Box component="span" sx={{
      display: 'inline-flex', alignItems: 'center',
      px: '8px', py: '2px', fontSize: '11px', fontWeight: 500,
      borderRadius: '20px', whiteSpace: 'nowrap',
      backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      {value}
    </Box>
  );
}

// ─── RFP mini-row ─────────────────────────────────────────────────────────────

function RFPMiniRow({ row, navigate }) {
  const days = differenceInCalendarDays(parseISO(row.deadline), TODAY);
  const isOverdue = days < 0;
  const isUrgent = !isOverdue && days <= 2;

  return (
    <Stack direction="row" alignItems="center"
      sx={{
        px: '16px', py: '12px', borderBottom: `1px solid ${C.divider}`,
        bgcolor: isOverdue ? '#fff8f7' : 'transparent',
        cursor: row.isHandedOff || row.isDTQ ? 'default' : 'pointer',
        '&:hover': { bgcolor: row.isHandedOff || row.isDTQ ? (isOverdue ? '#fff8f7' : 'transparent') : C.bgPage },
        transition: 'background 0.1s',
        '&:last-child': { borderBottom: 'none' },
      }}
      onClick={() => !row.isHandedOff && !row.isDTQ && navigate(`/rfp/${row.id}`)}>

      {/* Group name + flags */}
      <Stack direction="row" alignItems="center" spacing={0.75} sx={{ flex: 1, minWidth: 0 }}>
        {row.isDuplicate && (
          <Tooltip title="Possible duplicate">
            <FlagIcon sx={{ fontSize: 12, color: C.red, flexShrink: 0 }} />
          </Tooltip>
        )}
        <Typography noWrap sx={{
          fontSize: '14px', fontWeight: 500,
          color: row.isDTQ ? C.grayMid : row.isHandedOff ? C.grayMid : C.blueLight,
          textDecoration: 'none',
        }}>
          {row.groupName}
        </Typography>
        {row.isRush && (
          <Box component="span" sx={{ flexShrink: 0, px: '6px', py: '1px', borderRadius: '4px', border: '1px solid #ffe0b2', bgcolor: '#fff3e0', fontSize: '10px', fontWeight: 600, color: C.orange }}>Rush</Box>
        )}
      </Stack>

      {/* Census status */}
      <Box sx={{ width: 148, flexShrink: 0, display: 'flex', justifyContent: 'flex-start' }}>
        <StatusPill value={row.isDTQ ? 'DTQ' : row.censusStatus} />
      </Box>

      {/* Deadline */}
      <Box sx={{ width: 100, flexShrink: 0, textAlign: 'right' }}>
        {row.isHandedOff ? (
          <Typography sx={{ fontSize: '12px', color: C.grayMid }}>Handed off</Typography>
        ) : (
          <Stack alignItems="flex-end" spacing={0.25}>
            <Typography sx={{ fontSize: '12px', fontWeight: 500, color: isOverdue ? C.red : isUrgent ? C.orange : C.black }}>
              {format(parseISO(row.deadline), 'MMM d')}
            </Typography>
            <Typography sx={{ fontSize: '11px', color: isOverdue ? C.red : isUrgent ? C.orange : C.grayMid }}>
              {isOverdue ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : `${days}d left`}
            </Typography>
          </Stack>
        )}
      </Box>
    </Stack>
  );
}

// ─── UW queue card ────────────────────────────────────────────────────────────

function UWCard({ initials, rows, navigate }) {
  const meta = UW_META[initials] || { name: initials, tpa: '—', color: C.grayMid, bg: '#f1f1f1' };
  const active    = rows.filter((r) => !r.isDTQ && !r.isHandedOff);
  const rush      = rows.filter((r) => r.isRush);
  const overdue   = rows.filter((r) => !r.isHandedOff && differenceInCalendarDays(parseISO(r.deadline), TODAY) < 0);
  const handedOff = rows.filter((r) => r.isHandedOff);

  return (
    <Paper elevation={0} sx={{ border: `1px solid ${C.divider}`, borderRadius: '8px', bgcolor: C.bgPaper, boxShadow: 'none', overflow: 'hidden' }}>

      {/* Card header */}
      <Stack direction="row" alignItems="center" justifyContent="space-between"
        sx={{ px: '20px', py: '16px', borderBottom: `1px solid ${C.divider}` }}>
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Avatar sx={{ width: 36, height: 36, bgcolor: meta.bg, color: meta.color, fontSize: '13px', fontWeight: 700 }}>
            {initials}
          </Avatar>
          <Box>
            <Typography sx={{ fontSize: '14px', fontWeight: 600, color: C.black, lineHeight: 1.3 }}>{meta.name}</Typography>
            <Typography sx={{ fontSize: '12px', color: C.grayMid }}>TPA: {meta.tpa}</Typography>
          </Box>
        </Stack>
        <Stack direction="row" spacing={2} alignItems="center">
          <Stack alignItems="center">
            <Typography sx={{ fontSize: '18px', fontWeight: 700, color: C.black, lineHeight: 1 }}>{active.length}</Typography>
            <Typography sx={{ fontSize: '11px', color: C.grayMid }}>Active</Typography>
          </Stack>
          {rush.length > 0 && (
            <Stack alignItems="center">
              <Typography sx={{ fontSize: '18px', fontWeight: 700, color: C.orange, lineHeight: 1 }}>{rush.length}</Typography>
              <Typography sx={{ fontSize: '11px', color: C.grayMid }}>Rush</Typography>
            </Stack>
          )}
          {overdue.length > 0 && (
            <Stack alignItems="center">
              <Typography sx={{ fontSize: '18px', fontWeight: 700, color: C.red, lineHeight: 1 }}>{overdue.length}</Typography>
              <Typography sx={{ fontSize: '11px', color: C.grayMid }}>Overdue</Typography>
            </Stack>
          )}
        </Stack>
      </Stack>

      {/* Mini table header */}
      {rows.length > 0 && (
        <Stack direction="row" alignItems="center"
          sx={{ px: '16px', py: '8px', bgcolor: '#f7f7f7', borderBottom: `1px solid ${C.divider}` }}>
          <Typography sx={{ flex: 1, fontSize: '11px', fontWeight: 500, color: C.grayMid, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Group
          </Typography>
          <Typography sx={{ width: 148, fontSize: '11px', fontWeight: 500, color: C.grayMid, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
            Census
          </Typography>
          <Typography sx={{ width: 100, fontSize: '11px', fontWeight: 500, color: C.grayMid, textTransform: 'uppercase', letterSpacing: '0.06em', textAlign: 'right' }}>
            Deadline
          </Typography>
        </Stack>
      )}

      {/* RFP rows */}
      {rows.length === 0 ? (
        <Box sx={{ px: '16px', py: '24px', textAlign: 'center' }}>
          <Typography sx={{ fontSize: '13px', color: C.grayMid }}>No RFPs assigned.</Typography>
        </Box>
      ) : (
        rows.map((row) => <RFPMiniRow key={row.id} row={row} navigate={navigate} />)
      )}

    </Paper>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function UWWorkspace() {
  const navigate = useNavigate();
  const { rows } = useQuoteLog();

  const [activeUW, setActiveUW] = useState('all');
  const UW_TABS = ['all', 'SR', 'JM', 'VC'];

  const stats = useMemo(() => ({
    active:   rows.filter((r) => !r.isDTQ && !r.isHandedOff).length,
    rush:     rows.filter((r) => r.isRush && !r.isHandedOff).length,
    overdue:  rows.filter((r) => !r.isHandedOff && differenceInCalendarDays(parseISO(r.deadline), TODAY) < 0).length,
    dtq:      rows.filter((r) => r.isDTQ).length,
    handedOff:rows.filter((r) => r.isHandedOff).length,
  }), [rows]);

  const uwGroups = useMemo(() => {
    const initials = ['SR', 'JM', 'VC'];
    return initials.map((uw) => ({
      initials: uw,
      rows: rows.filter((r) => r.assignedUW === uw).sort((a, b) => {
        if (a.isRush && !b.isRush) return -1;
        if (!a.isRush && b.isRush) return 1;
        return differenceInCalendarDays(parseISO(a.deadline), parseISO(b.deadline));
      }),
    })).filter((g) => activeUW === 'all' || g.initials === activeUW);
  }, [rows, activeUW]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* ── Page header ── */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: '20px' }}>
        <Stack spacing={0.5}>
          <Typography sx={{ fontSize: '20px', fontWeight: 600, color: C.black, lineHeight: 1 }}>
            UW Workspace
          </Typography>
          <Typography sx={{ fontSize: '13px', color: C.grayMid }}>
            {stats.active} active · {stats.handedOff} handed off
          </Typography>
        </Stack>
        <Button variant="contained"
          onClick={() => navigate('/new-rfp')}
          sx={{ height: 36, px: 2, fontSize: '13px', fontWeight: 500, borderRadius: '6px', bgcolor: C.blueLight, boxShadow: 'none', '&:hover': { bgcolor: '#0e57a0', boxShadow: 'none' } }}>
          New RFP
        </Button>
      </Stack>

      {/* ── Summary stats ── */}
      <Stack direction="row" spacing={0} sx={{ mb: '20px', gap: '12px', flexWrap: 'wrap' }}>
        <StatCard label="Active queue"  value={stats.active}   sub={`${rows.length} total records`} />
        <StatCard label="Rush cases"    value={stats.rush}     accent={stats.rush > 0 ? C.orange : C.black} sub={stats.rush > 0 ? '1-day SLA' : 'None pending'} />
        <StatCard label="Overdue"       value={stats.overdue}  accent={stats.overdue > 0 ? C.red : C.black} sub={stats.overdue > 0 ? 'Needs attention' : 'All on track'} />
        <StatCard label="DTQ"           value={stats.dtq}      accent={stats.dtq > 0 ? C.red : C.black} sub="Declined to quote" />
      </Stack>

      {/* ── UW filter tabs ── */}
      <Stack direction="row" alignItems="center" spacing={0} sx={{ mb: '16px', gap: '6px' }}>
        {UW_TABS.map((uw) => (
          <Box key={uw} component="button" onClick={() => setActiveUW(uw)}
            sx={{
              display: 'inline-flex', alignItems: 'center', px: '14px', height: 32,
              borderRadius: '20px', border: `1px solid ${activeUW === uw ? C.blueLight : C.divider}`,
              bgcolor: activeUW === uw ? C.blueLightBg : '#fcfcfc',
              color: activeUW === uw ? C.blue : '#28313e',
              fontSize: '13px', fontWeight: activeUW === uw ? 500 : 400,
              cursor: 'pointer', outline: 'none', whiteSpace: 'nowrap',
              '&:hover': { borderColor: C.blueLight, bgcolor: C.blueLightBg, color: C.blue },
            }}>
            {uw === 'all' ? 'All UW' : uw}
            {uw !== 'all' && (
              <Box component="span" sx={{ ml: 0.75, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 18, height: 18, borderRadius: '9px', bgcolor: activeUW === uw ? C.blueLight : '#f1f1f1', color: activeUW === uw ? '#fff' : C.grayMid, fontSize: '10px', fontWeight: 600, px: '4px' }}>
                {rows.filter((r) => r.assignedUW === uw).length}
              </Box>
            )}
          </Box>
        ))}
      </Stack>

      {/* ── UW cards ── */}
      <Stack spacing={0} sx={{ gap: '16px' }}>
        {uwGroups.map(({ initials, rows: uwRows }) => (
          <UWCard key={initials} initials={initials} rows={uwRows} navigate={navigate} />
        ))}
      </Stack>

    </Box>
  );
}
