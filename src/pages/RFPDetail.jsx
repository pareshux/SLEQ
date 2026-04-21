import { useMemo, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Stack, Typography, Paper, Button, Tooltip,
  Select, MenuItem, Snackbar, Alert,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutlined';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import FlagIcon from '@mui/icons-material/Flag';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { format, parseISO, differenceInCalendarDays } from 'date-fns';
import { C } from '../theme/theme';
import { STATUS_STYLES, TPA_MAP, useQuoteLog } from '../context/QuoteLogStore';

// ─── Shared TODAY ─────────────────────────────────────────────────────────────

const TODAY = parseISO('2026-04-21');

// ─── Status pill ──────────────────────────────────────────────────────────────

function StatusPill({ value }) {
  if (!value || value === '—') {
    return <Typography sx={{ fontSize: '14px', color: C.grayMid }}>—</Typography>;
  }
  const s = STATUS_STYLES[value];
  if (!s) return <Typography sx={{ fontSize: '14px', color: C.grayMid }}>—</Typography>;
  return (
    <Box component="span" sx={{
      display: 'inline-flex', alignItems: 'center',
      px: '10px', py: '3px', fontSize: '12px', fontWeight: 500,
      borderRadius: '20px', whiteSpace: 'nowrap',
      backgroundColor: s.bg, color: s.color, border: `1px solid ${s.border}`,
    }}>
      {value}
    </Box>
  );
}

// ─── Editable status cell ─────────────────────────────────────────────────────

const CENSUS_OPTIONS = ['Census Received', 'Ready for Associate', 'Census Loaded', 'Waiting', 'DTQ', '—'];
const SOB_OPTIONS    = ['—', 'Received', 'In Progress', 'Entered', 'DTQ'];
const RISK_OPTIONS   = ['—', 'Received', 'In Progress', 'Entered', 'DTQ'];
const SETUP_OPTIONS  = ['—', 'In Progress', 'Done'];

function EditableSelect({ value, options, onChange, readOnly }) {
  if (readOnly) return <StatusPill value={value} />;
  return (
    <Select value={value || '—'} onChange={(e) => onChange(e.target.value)}
      variant="standard" disableUnderline
      renderValue={(v) => <StatusPill value={v} />}
      sx={{
        cursor: 'pointer',
        '& .MuiSelect-select': { p: 0, display: 'flex', alignItems: 'center', '&:focus': { bgcolor: 'transparent' } },
        '& .MuiSelect-icon': { display: 'none' },
        '&:hover': { opacity: 0.8 },
      }}
      MenuProps={{
        PaperProps: { sx: { borderRadius: '8px', border: `1px solid ${C.divider}`, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', minWidth: 200, mt: 0.5 } },
      }}>
      {options.map((opt) => (
        <MenuItem key={opt} value={opt} sx={{ py: 1, px: 2, fontSize: '14px' }}>
          <StatusPill value={opt} />
        </MenuItem>
      ))}
    </Select>
  );
}

// ─── Info row ─────────────────────────────────────────────────────────────────

function InfoRow({ label, children, noBorder }) {
  return (
    <Stack direction="row" alignItems="center"
      sx={{ py: '11px', borderBottom: noBorder ? 'none' : `1px solid ${C.divider}` }}>
      <Typography sx={{ fontSize: '13px', color: C.grayMid, width: 148, flexShrink: 0, fontWeight: 400 }}>
        {label}
      </Typography>
      <Box sx={{ flex: 1 }}>{children}</Box>
    </Stack>
  );
}

// ─── Detail card ──────────────────────────────────────────────────────────────

function DetailCard({ title, children, sx }) {
  return (
    <Paper elevation={0} sx={{
      border: `1px solid ${C.divider}`, borderRadius: '8px',
      p: '20px 24px', bgcolor: C.bgPaper, boxShadow: 'none', ...sx,
    }}>
      <Typography sx={{
        fontSize: '11px', fontWeight: 500, color: C.grayMid,
        textTransform: 'uppercase', letterSpacing: '0.06em',
        mb: '12px', pb: '10px', borderBottom: `1px solid ${C.divider}`,
      }}>
        {title}
      </Typography>
      {children}
    </Paper>
  );
}

// ─── Flag banner ──────────────────────────────────────────────────────────────

function FlagBanner({ variant, title, description }) {
  const styles = {
    warning: { bg: '#fff3e0', border: C.orange, titleColor: C.orange },
    error:   { bg: '#fdecea', border: C.red,    titleColor: C.red },
    info:    { bg: C.blueLightBg, border: C.blueLight, titleColor: C.blueLight },
  };
  const s = styles[variant] || styles.info;
  return (
    <Stack sx={{ p: '12px 16px', bgcolor: s.bg, borderLeft: `3px solid ${s.border}`, borderRadius: '6px' }}>
      <Typography sx={{ fontSize: '13px', fontWeight: 600, color: s.titleColor, mb: '2px' }}>{title}</Typography>
      <Typography sx={{ fontSize: '13px', color: '#28313e', lineHeight: 1.6 }}>{description}</Typography>
    </Stack>
  );
}

// ─── Days badge ───────────────────────────────────────────────────────────────

function DaysBadge({ deadline }) {
  const days = differenceInCalendarDays(parseISO(deadline), TODAY);
  const isOverdue = days < 0;
  const isUrgent = !isOverdue && days <= 3;
  const label = isOverdue ? `${Math.abs(days)}d overdue` : days === 0 ? 'Due today' : `${days}d left`;
  return (
    <Box component="span" sx={{
      px: '8px', py: '2px', borderRadius: '4px', fontSize: '12px', fontWeight: 500,
      bgcolor:  isOverdue ? '#fdecea' : isUrgent ? '#fff3e0' : '#f0f7ec',
      color:    isOverdue ? C.red     : isUrgent ? C.orange  : C.green,
      border: `1px solid ${isOverdue ? '#f5c1c1' : isUrgent ? '#ffe0b2' : '#c8e6b0'}`,
    }}>
      {label}
    </Box>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function RFPDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { rows, updateRow } = useQuoteLog();
  const [saveToast, setSaveToast] = useState(false);

  const row = useMemo(() => rows.find((r) => String(r.id) === String(id)), [rows, id]);

  const handleUpdate = useCallback((field, value) => {
    updateRow(Number(id), { [field]: value });
    setSaveToast(true);
  }, [id, updateRow]);

  // ── Not found ──

  if (!row) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', py: '80px', gap: 2 }}>
        <Box sx={{ width: 48, height: 48, borderRadius: '50%', bgcolor: C.bgBaseGray, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <LockOutlinedIcon sx={{ fontSize: 22, color: C.grayMid }} />
        </Box>
        <Typography sx={{ fontSize: '20px', fontWeight: 600, color: C.black }}>RFP not found</Typography>
        <Typography sx={{ fontSize: '14px', color: C.grayMid, maxWidth: 340, textAlign: 'center', lineHeight: 1.6 }}>
          This record may have been removed or the link is invalid.
        </Typography>
        <Button variant="contained"
          sx={{ height: 36, px: 2.5, mt: 1, fontSize: '13px', borderRadius: '6px', boxShadow: 'none', bgcolor: C.blueLight }}
          onClick={() => navigate('/')}>
          Back to Quote Log
        </Button>
      </Box>
    );
  }

  const tpa = TPA_MAP[row.tpa];
  const isReadOnly = row.isDTQ || row.isHandedOff;

  return (
    <Box sx={{ pb: 6 }}>

      {/* ── Sticky header ── */}
      <Stack direction="row" alignItems="center" justifyContent="space-between"
        sx={{
          position: 'sticky', top: 0, zIndex: 100,
          bgcolor: '#f7f7f7', borderBottom: `1px solid ${C.divider}`,
          height: 56, mx: -4, px: 4, mb: '28px',
        }}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Button
            startIcon={<ArrowBackIcon sx={{ fontSize: '16px !important' }} />}
            onClick={() => navigate('/')}
            sx={{
              height: 32, px: 1.5, fontSize: '13px', color: C.grayMid,
              bgcolor: 'transparent', border: 'none', boxShadow: 'none',
              '&:hover': { bgcolor: C.bgBaseGray, color: C.black, boxShadow: 'none' },
            }}>
            Quote Log
          </Button>
          <Typography sx={{ color: C.darkGray, fontSize: '16px', lineHeight: 1, userSelect: 'none' }}>/</Typography>
          <Typography sx={{ fontSize: '14px', fontWeight: 500, color: C.black, maxWidth: 260 }} noWrap>
            {row.groupName}
          </Typography>
          <Stack direction="row" spacing={0.75} alignItems="center">
            <Box component="span" sx={{
              display: 'inline-flex', alignItems: 'center', px: '10px', py: '3px',
              fontSize: '12px', fontWeight: 500, borderRadius: '20px',
              bgcolor: '#f1f1f1', color: '#28313e', border: '1px solid #e8e8e8',
            }}>
              {row.type === 'RENEWAL' ? 'Renewal' : 'New'}
            </Box>
            {row.isRush && (
              <Box component="span" sx={{ px: '8px', py: '2px', borderRadius: '4px', border: '1px solid #ffe0b2', bgcolor: '#fff3e0', fontSize: '11px', fontWeight: 600, color: C.orange }}>Rush</Box>
            )}
            {row.isDTQ && (
              <Box component="span" sx={{ px: '8px', py: '2px', borderRadius: '4px', border: '1px solid #f5c1c1', bgcolor: '#fdecea', fontSize: '11px', fontWeight: 600, color: C.red }}>DTQ</Box>
            )}
            {row.isHandedOff && (
              <Box component="span" sx={{ px: '8px', py: '2px', borderRadius: '4px', border: '1px solid #e8e8e8', bgcolor: '#f1f1f1', fontSize: '11px', fontWeight: 500, color: C.grayMid }}>Handed off</Box>
            )}
          </Stack>
        </Stack>
        <Stack direction="row" spacing={1.5}>
          <Button
            startIcon={<EditOutlinedIcon sx={{ fontSize: '14px !important' }} />}
            sx={{
              height: 36, px: 2, fontSize: '13px', fontWeight: 500,
              borderRadius: '6px', border: `1px solid ${C.divider}`,
              color: '#28313e', bgcolor: 'transparent', boxShadow: 'none',
              '&:hover': { bgcolor: C.bgBaseGray, boxShadow: 'none' },
            }}>
            Edit RFP
          </Button>
          {!row.isHandedOff && !row.isDTQ && (
            <Button
              startIcon={<CheckCircleOutlineIcon sx={{ fontSize: '14px !important' }} />}
              variant="contained"
              sx={{
                height: 36, px: 2, fontSize: '13px', fontWeight: 500,
                borderRadius: '6px', boxShadow: 'none', bgcolor: C.green,
                '&:hover': { bgcolor: '#3d6a05', boxShadow: 'none' },
              }}>
              Hand Off
            </Button>
          )}
        </Stack>
      </Stack>

      {/* ── Status overview strip ── */}
      <Paper elevation={0} sx={{
        border: `1px solid ${C.divider}`, borderRadius: '8px',
        p: '16px 24px', bgcolor: C.bgPaper, mb: '20px', boxShadow: 'none',
      }}>
        <Stack direction="row" alignItems="center" sx={{ flexWrap: 'wrap', gap: '28px' }}>
          {[
            { label: 'Census',  value: row.isDTQ ? 'DTQ' : row.censusStatus, field: 'censusStatus', options: CENSUS_OPTIONS },
            { label: 'SoB',     value: row.isDTQ ? 'DTQ' : row.sob,          field: 'sob',          options: SOB_OPTIONS },
            { label: 'Risk',    value: row.type === 'NEW' ? '—' : (row.isDTQ ? 'DTQ' : row.risk), field: 'risk', options: RISK_OPTIONS, skip: row.type === 'NEW' },
            { label: 'Setup',   value: row.isDTQ ? 'DTQ' : row.setup,        field: 'setup',        options: SETUP_OPTIONS },
          ].map(({ label, value, field, options, skip }) => (
            <Stack key={label} spacing={0.75}>
              <Typography sx={{ fontSize: '11px', fontWeight: 500, color: C.grayMid, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {label}
              </Typography>
              {skip
                ? <Typography sx={{ fontSize: '14px', color: C.grayMid }}>N/A</Typography>
                : <Tooltip title={isReadOnly ? '' : 'Click to update'} placement="top" arrow>
                    <Box sx={{ cursor: isReadOnly ? 'default' : 'pointer' }}>
                      <EditableSelect
                        value={value} options={options}
                        readOnly={isReadOnly}
                        onChange={(v) => handleUpdate(field, v)}
                      />
                    </Box>
                  </Tooltip>
              }
            </Stack>
          ))}

          <Box sx={{ ml: 'auto' }}>
            <Stack spacing={0.75} alignItems="flex-end">
              <Typography sx={{ fontSize: '11px', fontWeight: 500, color: C.grayMid, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Deadline
              </Typography>
              <Stack direction="row" alignItems="center" spacing={1}>
                <Typography sx={{ fontSize: '14px', fontWeight: 600, color: C.black }}>
                  {format(parseISO(row.deadline), 'MMM d, yyyy')}
                </Typography>
                <DaysBadge deadline={row.deadline} />
              </Stack>
            </Stack>
          </Box>
        </Stack>

        {isReadOnly && (
          <Stack direction="row" alignItems="center" spacing={0.75} sx={{ mt: 1.5, pt: 1.5, borderTop: `1px solid ${C.divider}` }}>
            <LockOutlinedIcon sx={{ fontSize: 13, color: C.grayMid }} />
            <Typography sx={{ fontSize: '12px', color: C.grayMid }}>
              {row.isDTQ ? 'This record is marked DTQ — status fields are read-only.' : 'This record has been handed off — status fields are read-only.'}
            </Typography>
          </Stack>
        )}
      </Paper>

      {/* ── Two-column detail grid ── */}
      <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>

        {/* Account details */}
        <DetailCard title="Account details">
          <InfoRow label="Group name">
            <Stack direction="row" alignItems="center" spacing={1}>
              {row.isDuplicate && (
                <Tooltip title="Possible duplicate record">
                  <FlagIcon sx={{ fontSize: 14, color: C.red, flexShrink: 0 }} />
                </Tooltip>
              )}
              <Typography sx={{ fontSize: '14px', fontWeight: 500, color: C.black }}>{row.groupName}</Typography>
            </Stack>
          </InfoRow>
          <InfoRow label="Type">
            <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', px: '10px', py: '3px', fontSize: '12px', fontWeight: 500, borderRadius: '20px', bgcolor: '#f1f1f1', color: '#28313e', border: '1px solid #e8e8e8' }}>
              {row.type === 'RENEWAL' ? 'Renewal' : 'New'}
            </Box>
          </InfoRow>
          <InfoRow label="Effective date">
            <Typography sx={{ fontSize: '14px', color: C.black }}>{row.effectiveDate || '—'}</Typography>
          </InfoRow>
          <InfoRow label="TPA">
            <Typography sx={{ fontSize: '14px', fontWeight: 500, color: C.black }}>{row.tpa}</Typography>
          </InfoRow>
          {tpa && (
            <>
              <InfoRow label="Carrier">
                <Typography sx={{ fontSize: '14px', color: C.black }}>{tpa.carrier}</Typography>
              </InfoRow>
              <InfoRow label="Impl. specialist">
                <Typography sx={{ fontSize: '14px', color: C.black }}>{tpa.is}</Typography>
              </InfoRow>
            </>
          )}
          <InfoRow label="Producer" noBorder>
            <Typography sx={{ fontSize: '14px', color: C.black }}>{row.producer || '—'}</Typography>
          </InfoRow>
        </DetailCard>

        {/* Dates & timeline */}
        <DetailCard title="Dates & timeline">
          <InfoRow label="Request date">
            <Typography sx={{ fontSize: '14px', color: C.black }}>
              {format(parseISO(row.requestDate), 'MMM d, yyyy')}
            </Typography>
          </InfoRow>
          <InfoRow label="Deadline">
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography sx={{ fontSize: '14px', fontWeight: 500, color: C.black }}>
                {format(parseISO(row.deadline), 'MMM d, yyyy')}
              </Typography>
              <DaysBadge deadline={row.deadline} />
            </Stack>
          </InfoRow>
          <InfoRow label="SLA">
            <Typography sx={{ fontSize: '14px', color: C.black }}>
              {row.isRush ? '1 business day (Rush)' : '3 business days'}
            </Typography>
          </InfoRow>
          {tpa?.notes && (
            <InfoRow label="TPA notes" noBorder>
              <Typography sx={{ fontSize: '13px', color: C.grayMid, lineHeight: 1.6 }}>{tpa.notes}</Typography>
            </InfoRow>
          )}
        </DetailCard>

        {/* Underwriter assignment */}
        <DetailCard title="Underwriter assignment">
          <InfoRow label="Assigned UW">
            <Stack direction="row" alignItems="center" spacing={1.5}>
              <Box sx={{
                width: 28, height: 28, borderRadius: '50%',
                bgcolor: C.blueLightBg, color: C.blue,
                fontSize: '11px', fontWeight: 600,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {row.assignedUW}
              </Box>
              <Typography sx={{ fontSize: '14px', color: C.black }}>{tpa?.uw || row.assignedUW}</Typography>
            </Stack>
          </InfoRow>
          <InfoRow label="TPA default UW">
            <Typography sx={{ fontSize: '14px', color: C.grayMid }}>{tpa?.uw || '—'}</Typography>
          </InfoRow>
          <InfoRow label="Record status" noBorder>
            {row.isDTQ ? (
              <StatusPill value="DTQ" />
            ) : row.isHandedOff ? (
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', px: '10px', py: '3px', fontSize: '12px', fontWeight: 500, borderRadius: '20px', bgcolor: '#f1f1f1', color: C.grayMid, border: '1px solid #e8e8e8' }}>
                Handed Off
              </Box>
            ) : (
              <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', px: '10px', py: '3px', fontSize: '12px', fontWeight: 500, borderRadius: '20px', bgcolor: '#e1eaf7', color: '#1166bb', border: '1px solid #b5d4f4' }}>
                Active
              </Box>
            )}
          </InfoRow>
        </DetailCard>

        {/* Flags & notes */}
        <DetailCard title="Flags & notes">
          <Stack spacing={1.5}>
            {!row.isDTQ && !row.isDuplicate && !row.isRush && (
              <Typography sx={{ fontSize: '14px', color: C.grayMid, py: 1 }}>
                No flags on this record.
              </Typography>
            )}
            {row.isRush && (
              <FlagBanner
                variant="warning"
                title="Rush case"
                description="SLA reduced to 1 business day. This record is prioritized in the UW queue."
              />
            )}
            {row.isDTQ && (
              <FlagBanner
                variant="error"
                title="Declined to Quote"
                description="This case has been marked DTQ and cannot be quoted under standard guidelines."
              />
            )}
            {row.isDuplicate && (
              <FlagBanner
                variant="warning"
                title="Possible duplicate"
                description="A record with a similar group name already exists in the queue. Review before proceeding."
              />
            )}
          </Stack>
        </DetailCard>

      </Box>

      {/* ── Saved toast ── */}
      <Snackbar open={saveToast} autoHideDuration={2500} onClose={() => setSaveToast(false)}>
        <Alert severity="success" variant="filled" onClose={() => setSaveToast(false)}
          sx={{ borderRadius: '6px', fontSize: '13px', fontWeight: 500, boxShadow: '0 4px 16px rgba(0,0,0,0.12)' }}>
          Status updated
        </Alert>
      </Snackbar>
    </Box>
  );
}
