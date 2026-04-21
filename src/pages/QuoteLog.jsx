import { useState, useMemo, useCallback, useEffect } from 'react';
import {
  Box, Button, Stack, Typography, Tooltip,
  Select, MenuItem, Snackbar, Alert, Avatar,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon from '@mui/icons-material/Add';
import FlagIcon from '@mui/icons-material/Flag';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import { differenceInCalendarDays, parseISO, format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { C } from '../theme/theme';
import { STATUS_STYLES, useQuoteLog } from '../context/QuoteLogStore';

// ─── Constants ────────────────────────────────────────────────────────────────

const TODAY = parseISO('2026-04-21');

const CENSUS_OPTIONS = ['Waiting', 'Member Census', 'Employee Census', 'Experience', 'Apps', 'Ready for Associate', 'Census Loaded', 'DTQ', '—'];
const SOB_OPTIONS    = ['—', 'Received', 'In Progress', 'Entered', 'DTQ'];
const RISK_OPTIONS   = ['—', 'Received', 'In Progress', 'Entered', 'DTQ'];
const SETUP_OPTIONS  = ['—', 'In Progress', 'Done'];

// ─── Status pill ──────────────────────────────────────────────────────────────

function StatusPill({ value }) {
  if (!value || value === '—') {
    return <Typography sx={{ fontSize: '14px', color: C.grayMid, lineHeight: 1 }}>—</Typography>;
  }
  const s = STATUS_STYLES[value];
  if (!s) return <Typography sx={{ fontSize: '14px', color: C.grayMid, lineHeight: 1 }}>—</Typography>;
  return (
    <Box component="span" sx={{
      display: 'inline-flex', alignItems: 'center',
      px: '10px', py: '3px',
      fontSize: '12px', fontWeight: 500,
      borderRadius: '20px', whiteSpace: 'nowrap',
      backgroundColor: s.bg, color: s.color,
      border: `1px solid ${s.border}`,
      lineHeight: 1.4,
    }}>
      {value}
    </Box>
  );
}

// ─── Editable status cell ─────────────────────────────────────────────────────

function EditableStatusCell({ value, options, onChange, readOnly }) {
  if (readOnly) return <StatusPill value={value} />;
  return (
    <Tooltip title="Click to update" placement="top" arrow enterDelay={600}>
      <Select
        value={value || '—'}
        onChange={(e) => onChange(e.target.value)}
        variant="standard"
        disableUnderline
        onClick={(e) => e.stopPropagation()}
        renderValue={(v) => <StatusPill value={v} />}
        sx={{
          '& .MuiSelect-select': { p: 0, display: 'flex', alignItems: 'center', '&:focus': { backgroundColor: 'transparent' } },
          '& .MuiSelect-icon': { display: 'none' },
          cursor: 'pointer',
          '&:hover': { opacity: 0.8 },
        }}
      MenuProps={{
        PaperProps: {
          sx: {
            borderRadius: '8px',
            boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
            border: `1px solid ${C.divider}`,
            minWidth: 200,
            mt: 0.5,
          },
        },
      }}
    >
      {options.map((opt) => (
        <MenuItem key={opt} value={opt} sx={{ py: 1, px: 2, fontSize: '14px' }}>
          <StatusPill value={opt} />
        </MenuItem>
      ))}
    </Select>
    </Tooltip>
  );
}

// ─── Type chip ────────────────────────────────────────────────────────────────

function TypeText({ type }) {
  return (
    <Typography sx={{ fontSize: '14px', color: '#28313e', fontWeight: 400 }}>
      {type === 'RENEWAL' ? 'Renewal' : 'New'}
    </Typography>
  );
}

// ─── Filter chip ──────────────────────────────────────────────────────────────

function FilterChip({ label, selected, onClick }) {
  return (
    <Box component="button" onClick={onClick}
      sx={{
        display: 'inline-flex', alignItems: 'center',
        px: '14px', height: 32,
        borderRadius: '20px', border: `1px solid ${selected ? C.blueLight : C.divider}`,
        backgroundColor: selected ? C.blueLightBg : '#fcfcfc',
        color: selected ? C.blue : '#28313e',
        fontSize: '13px', fontWeight: selected ? 500 : 400,
        cursor: 'pointer', outline: 'none', whiteSpace: 'nowrap',
        transition: 'all 0.12s',
        '&:hover': { borderColor: C.blueLight, backgroundColor: C.blueLightBg, color: C.blue },
      }}>
      {label}
    </Box>
  );
}

// ─── Columns builder ──────────────────────────────────────────────────────────

function buildColumns(navigate, handleCellUpdate, savedFlash) {
  return [
    {
      field: 'groupName', headerName: 'Group name', flex: 2, minWidth: 220,
      renderCell: ({ row }) => (
        <Stack direction="row" alignItems="center" spacing={0.75}
          sx={{ height: '100%', width: '100%', minWidth: 0 }}>
          {row.isDuplicate && (
            <Tooltip title="Possible duplicate">
              <FlagIcon sx={{ fontSize: 14, color: C.red, flexShrink: 0 }} />
            </Tooltip>
          )}
          <Typography
            onClick={() => !row.isHandedOff && navigate(`/rfp/${row.id}`)}
            noWrap
            sx={{
              fontSize: '14px', fontWeight: 500,
              color: row.isDTQ ? '#99a0ab' : row.isHandedOff ? C.grayMid : C.blueLight,
              cursor: row.isHandedOff ? 'default' : 'pointer',
              textDecoration: 'none',
              '&:hover': { textDecoration: row.isHandedOff ? 'none' : 'underline' },
            }}>
            {row.groupName}
          </Typography>
          {row.isRush && (
            <Box component="span" sx={{
              flexShrink: 0, px: '7px', py: '2px',
              borderRadius: '4px', border: '1px solid #ffe0b2',
              backgroundColor: '#fff3e0', fontSize: '11px', fontWeight: 600,
              color: C.orange, whiteSpace: 'nowrap', lineHeight: 1.4,
            }}>
              Rush
            </Box>
          )}
        </Stack>
      ),
    },
    {
      field: 'type', headerName: 'Type', width: 96,
      renderCell: ({ row }) => <TypeText type={row.type} />,
    },
    {
      field: 'tpa', headerName: 'TPA', width: 80,
      renderCell: ({ row }) => (
        <Typography sx={{ fontSize: '14px', color: row.isDTQ ? C.grayMid : '#28313e', fontWeight: 400 }}>
          {row.tpa}
        </Typography>
      ),
    },
    {
      field: 'assignedUW', headerName: 'UW', width: 64,
      renderCell: ({ row }) => (
        <Tooltip title={row.assignedUW}>
          <Avatar sx={{
            width: 28, height: 28,
            fontSize: '11px', fontWeight: 600,
            backgroundColor: row.isDTQ || row.isHandedOff ? '#f1f1f1' : C.blueLightBg,
            color: row.isDTQ || row.isHandedOff ? C.grayMid : C.blue,
          }}>
            {row.assignedUW}
          </Avatar>
        </Tooltip>
      ),
    },
    {
      field: 'deadline', headerName: 'Request date', width: 152,
      renderCell: ({ row }) => {
        const days = differenceInCalendarDays(parseISO(row.deadline), TODAY);
        const isOverdue = days < 0;
        const dateColor = row.isDTQ ? C.grayMid : isOverdue ? C.red : C.black;
        const subColor  = row.isDTQ ? '#c0c0c0' : row.isHandedOff ? C.grayMid : isOverdue ? C.red : C.grayMid;
        let sub;
        if (row.isHandedOff)       sub = 'Handed off';
        else if (days > 0)         sub = `${days}d remaining`;
        else if (days === 0)       sub = 'Due today';
        else                       sub = `${Math.abs(days)}d overdue`;
        return (
          <Stack spacing={0.25} sx={{ height: '100%', justifyContent: 'center' }}>
            <Typography sx={{ fontSize: '14px', color: dateColor, lineHeight: 1.3, fontWeight: 400 }}>
              {format(parseISO(row.requestDate), 'MMM d, yyyy')}
            </Typography>
            <Typography sx={{ fontSize: '12px', color: subColor, lineHeight: 1.3 }}>
              {sub}
            </Typography>
          </Stack>
        );
      },
    },
    {
      field: 'censusStatus', headerName: 'Census', width: 172,
      renderCell: ({ row }) => {
        const flash = savedFlash[`${row.id}_censusStatus`];
        const isReadOnly = row.isDTQ || row.isHandedOff;
        return (
          <Box sx={{
            display: 'flex', alignItems: 'center', height: '100%',
            borderRadius: '6px', px: flash ? '6px' : 0,
            backgroundColor: flash ? '#f0fdf4' : 'transparent',
            transition: 'background 0.4s',
          }}>
            <EditableStatusCell
              value={row.isDTQ ? 'DTQ' : row.censusStatus}
              options={CENSUS_OPTIONS}
              readOnly={isReadOnly}
              onChange={(v) => handleCellUpdate(row.id, 'censusStatus', v)}
            />
          </Box>
        );
      },
    },
    {
      field: 'sob', headerName: 'SoB', width: 120,
      renderCell: ({ row }) => {
        const flash = savedFlash[`${row.id}_sob`];
        const isReadOnly = row.isDTQ || row.isHandedOff;
        return (
          <Box sx={{
            display: 'flex', alignItems: 'center', height: '100%',
            borderRadius: '6px', px: flash ? '6px' : 0,
            backgroundColor: flash ? '#f0fdf4' : 'transparent',
            transition: 'background 0.4s',
          }}>
            <EditableStatusCell
              value={row.isDTQ ? 'DTQ' : row.sob}
              options={SOB_OPTIONS}
              readOnly={isReadOnly}
              onChange={(v) => handleCellUpdate(row.id, 'sob', v)}
            />
          </Box>
        );
      },
    },
    {
      field: 'risk', headerName: 'Risk', width: 120,
      renderCell: ({ row }) => {
        if (row.type === 'NEW') {
          return <Typography sx={{ fontSize: '14px', color: C.grayMid }}>—</Typography>;
        }
        const flash = savedFlash[`${row.id}_risk`];
        const isReadOnly = row.isDTQ || row.isHandedOff;
        return (
          <Box sx={{
            display: 'flex', alignItems: 'center', height: '100%',
            borderRadius: '6px', px: flash ? '6px' : 0,
            backgroundColor: flash ? '#f0fdf4' : 'transparent',
            transition: 'background 0.4s',
          }}>
            <EditableStatusCell
              value={row.isDTQ ? 'DTQ' : row.risk}
              options={RISK_OPTIONS}
              readOnly={isReadOnly}
              onChange={(v) => handleCellUpdate(row.id, 'risk', v)}
            />
          </Box>
        );
      },
    },
    {
      field: 'setup', headerName: 'Setup', width: 104,
      renderCell: ({ row }) => {
        const flash = savedFlash[`${row.id}_setup`];
        const isReadOnly = row.isDTQ || row.isHandedOff;
        return (
          <Box sx={{
            display: 'flex', alignItems: 'center', height: '100%',
            borderRadius: '6px', px: flash ? '6px' : 0,
            backgroundColor: flash ? '#f0fdf4' : 'transparent',
            transition: 'background 0.4s',
          }}>
            <EditableStatusCell
              value={row.isDTQ ? 'DTQ' : row.setup}
              options={SETUP_OPTIONS}
              readOnly={isReadOnly}
              onChange={(v) => handleCellUpdate(row.id, 'setup', v)}
            />
          </Box>
        );
      },
    },
  ];
}

// ─── Main component ───────────────────────────────────────────────────────────

const STATUS_FILTERS = ['All', 'In Progress', 'Done', 'DTQ'];
const TYPE_FILTERS   = ['All', 'New', 'Renewal', 'Rush'];
const UW_OPTIONS     = ['All UW', 'SR', 'JM', 'VC'];

export default function QuoteLog() {
  const navigate = useNavigate();
  const { rows, updateRow, pendingToast, clearToast } = useQuoteLog();

  const [uwFilter, setUwFilter]         = useState('All UW');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter]     = useState('All');
  const [savedFlash, setSavedFlash]     = useState({});
  const [toastOpen, setToastOpen]       = useState(false);

  useEffect(() => {
    if (pendingToast) setToastOpen(true);
  }, [pendingToast]);

  const handleCellUpdate = useCallback((rowId, field, value) => {
    updateRow(rowId, { [field]: value });
    const key = `${rowId}_${field}`;
    setSavedFlash((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => setSavedFlash((prev) => { const n = { ...prev }; delete n[key]; return n; }), 1400);
  }, [updateRow]);

  const filteredRows = useMemo(() => rows.filter((row) => {
    if (uwFilter !== 'All UW' && row.assignedUW !== uwFilter) return false;
    if (typeFilter === 'New' && row.type !== 'NEW') return false;
    if (typeFilter === 'Renewal' && row.type !== 'RENEWAL') return false;
    if (typeFilter === 'Rush' && !row.isRush) return false;
    if (statusFilter === 'In Progress' && (row.isDTQ || row.isHandedOff)) return false;
    if (statusFilter === 'Done' && !row.isHandedOff) return false;
    if (statusFilter === 'DTQ' && !row.isDTQ) return false;
    return true;
  }), [rows, uwFilter, statusFilter, typeFilter]);

  const columns = useMemo(
    () => buildColumns(navigate, handleCellUpdate, savedFlash),
    [navigate, handleCellUpdate, savedFlash],
  );

  const hasActiveFilter = uwFilter !== 'All UW' || statusFilter !== 'All' || typeFilter !== 'All';

  function clearFilters() {
    setUwFilter('All UW');
    setStatusFilter('All');
    setTypeFilter('All');
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* ── Page header ── */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: '16px' }}>
        <Typography sx={{ fontSize: '20px', fontWeight: 600, color: C.black, lineHeight: 1 }}>
          Quote Log
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon sx={{ fontSize: '16px !important' }} />}
          onClick={() => navigate('/new-rfp')}
          sx={{
            height: 36, px: 2, fontSize: '13px', fontWeight: 500,
            bgcolor: C.blueLight, color: '#fff', borderRadius: '6px',
            boxShadow: 'none', border: 'none',
            '&:hover': { bgcolor: '#0e57a0', boxShadow: 'none' },
          }}>
          New RFP
        </Button>
      </Stack>

      {/* ── Filter bar ── */}
      <Stack direction="row" alignItems="center" sx={{ mb: '16px', flexWrap: 'wrap', gap: '12px' }}>

        {/* Underwriter group */}
        <Stack direction="row" alignItems="center" spacing="6px">
          <Typography sx={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.grayMid, whiteSpace: 'nowrap' }}>
            Underwriter
          </Typography>
          <Select
            value={uwFilter}
            onChange={(e) => setUwFilter(e.target.value)}
            variant="outlined"
            size="small"
            sx={{
              height: 32, borderRadius: '20px', fontSize: '13px',
              fontWeight: uwFilter !== 'All UW' ? 500 : 400,
              color: uwFilter !== 'All UW' ? C.blue : '#28313e',
              bgcolor: uwFilter !== 'All UW' ? C.blueLightBg : '#fcfcfc',
              '& .MuiOutlinedInput-notchedOutline': {
                borderColor: uwFilter !== 'All UW' ? C.blueLight : C.divider,
              },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: C.blueLight },
              '& .MuiSelect-select': { py: 0, pl: 1.75, pr: '28px !important', display: 'flex', alignItems: 'center', height: '32px' },
            }}
            MenuProps={{ PaperProps: { sx: { borderRadius: '8px', border: `1px solid ${C.divider}`, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', mt: 0.5 } } }}
          >
            {UW_OPTIONS.map((opt) => (
              <MenuItem key={opt} value={opt} sx={{ fontSize: '13px' }}>{opt}</MenuItem>
            ))}
          </Select>
        </Stack>

        <Box sx={{ width: '4px' }} />

        {/* Status group */}
        <Stack direction="row" alignItems="center" spacing="6px">
          <Typography sx={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.grayMid, whiteSpace: 'nowrap' }}>
            Status
          </Typography>
          {STATUS_FILTERS.map((s) => (
            <FilterChip key={s} label={s} selected={statusFilter === s} onClick={() => setStatusFilter(s)} />
          ))}
        </Stack>

        <Box sx={{ width: '4px' }} />

        {/* Type group */}
        <Stack direction="row" alignItems="center" spacing="6px">
          <Typography sx={{ fontSize: '11px', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.06em', color: C.grayMid, whiteSpace: 'nowrap' }}>
            Type
          </Typography>
          {TYPE_FILTERS.map((t) => (
            <FilterChip
              key={t}
              label={t === 'Rush' ? 'Rush only' : t}
              selected={typeFilter === t}
              onClick={() => setTypeFilter(t)}
            />
          ))}
        </Stack>

        {hasActiveFilter && (
          <Box component="button" onClick={clearFilters}
            sx={{
              ml: 'auto', fontSize: '13px', color: C.blueLight, background: 'none',
              border: 'none', cursor: 'pointer', outline: 'none', fontFamily: 'inherit',
              '&:hover': { textDecoration: 'underline' },
            }}>
            Clear filters
          </Box>
        )}
      </Stack>

      {/* ── Data grid ── */}
      <Box sx={{
        backgroundColor: '#fcfcfc', border: `1px solid ${C.divider}`,
        borderRadius: '8px', overflow: 'hidden',
      }}>
        <DataGrid
          rows={filteredRows}
          columns={columns}
          rowHeight={64}
          columnHeaderHeight={40}
          autoHeight
          disableRowSelectionOnClick
          hideFooter={filteredRows.length <= 25}
          onRowClick={(params, event) => {
            if (params.row.isHandedOff || params.row.isDTQ) return;
            if (event.target.closest('.MuiSelect-root') || event.target.closest('.MuiMenuItem-root')) return;
            navigate(`/rfp/${params.row.id}`);
          }}
          getRowClassName={(params) => {
            const days = differenceInCalendarDays(parseISO(params.row.deadline), TODAY);
            if (params.row.isDTQ)        return 'row-dtq';
            if (params.row.isHandedOff)  return 'row-handed-off';
            if (params.row.isRush)       return 'row-rush';
            if (days < 0)               return 'row-overdue';
            return '';
          }}
          sx={{
            border: 'none',
            fontFamily: '"DM Sans", sans-serif',
            bgcolor: '#fcfcfc',
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f7f7f7',
              borderBottom: `1px solid ${C.divider}`,
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontSize: '11px', fontWeight: 500, color: C.grayMid,
              textTransform: 'uppercase', letterSpacing: '0.06em',
            },
            '& .MuiDataGrid-columnSeparator': { display: 'none' },
            '& .MuiDataGrid-sortIcon': { fontSize: '14px', color: C.grayMid, opacity: 0 },
            '& .MuiDataGrid-columnHeader:hover .MuiDataGrid-sortIcon': { opacity: 1 },
            '& .MuiDataGrid-cell': {
              borderBottom: `1px solid ${C.divider}`,
              padding: '0 16px',
              outline: 'none !important',
              display: 'flex',
              alignItems: 'center',
            },
            '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': { outline: 'none' },
            '& .MuiDataGrid-row': { cursor: 'pointer' },
            '& .MuiDataGrid-row.row-dtq': { cursor: 'default' },
            '& .MuiDataGrid-row.row-handed-off': { cursor: 'default' },
            '& .MuiDataGrid-row:hover': { backgroundColor: '#f7f7f7' },
            '& .MuiDataGrid-row.row-dtq .MuiDataGrid-cell': { opacity: 0.55 },
            '& .MuiDataGrid-row:last-child .MuiDataGrid-cell': { borderBottom: 'none' },
          }}
        />
      </Box>

      {filteredRows.length === 0 && (
        <Box sx={{ textAlign: 'center', py: '64px', px: 4 }}>
          <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: C.bgBaseGray, mx: 'auto', mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <InboxOutlinedIcon sx={{ fontSize: 22, color: C.grayMid }} />
          </Box>
          <Typography sx={{ fontSize: '14px', fontWeight: 500, color: C.black, mb: 0.5 }}>
            No records found
          </Typography>
          <Typography sx={{ fontSize: '13px', color: C.grayMid, mb: 2 }}>
            No RFPs match the current filters.
          </Typography>
          <Box component="button" onClick={clearFilters}
            sx={{ fontSize: '13px', color: C.blueLight, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', '&:hover': { textDecoration: 'underline' } }}>
            Clear all filters
          </Box>
        </Box>
      )}

      {/* ── Toast ── */}
      <Snackbar open={toastOpen} autoHideDuration={4000} onClose={() => { setToastOpen(false); clearToast(); }}>
        <Alert severity="success" variant="filled" onClose={() => { setToastOpen(false); clearToast(); }}
          sx={{ borderRadius: '6px', fontSize: '13px', fontWeight: 500, boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
          {pendingToast}
        </Alert>
      </Snackbar>
    </Box>
  );
}
