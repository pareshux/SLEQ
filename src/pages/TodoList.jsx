import { useState, useMemo } from 'react';
import {
  Box, Stack, Typography, Paper, Button, Chip,
  Checkbox, IconButton, TextField, Tooltip, Select, MenuItem,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutlined';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import FilterListIcon from '@mui/icons-material/FilterList';
import { parseISO, differenceInCalendarDays, format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { C } from '../theme/theme';

// ─── Constants ────────────────────────────────────────────────────────────────

const TODAY_DATE = parseISO('2026-04-21');

const PRIORITY_STYLES = {
  high:   { label: 'High',   bg: '#fdecea', color: C.red,    border: '#f5c1c1' },
  medium: { label: 'Medium', bg: '#fff3e0', color: C.orange, border: '#ffe0b2' },
  low:    { label: 'Low',    bg: '#f1f1f1', color: C.grayMid, border: '#e8e8e8' },
};

const INITIAL_TODOS = [
  {
    id: 1, text: 'Request updated census from Heartland Manufacturing Co',
    linkedGroup: 'Heartland Manufacturing Co', rfpId: 1,
    dueDate: '2026-04-22', done: false, priority: 'high', assignedUW: 'SR',
  },
  {
    id: 2, text: 'Follow up on SoB submission — Ironwood Industries is still Waiting',
    linkedGroup: 'Ironwood Industries', rfpId: 2,
    dueDate: '2026-04-23', done: false, priority: 'medium', assignedUW: 'SR',
  },
  {
    id: 3, text: 'Verify census duplicate flag — Summit Logistics LLC',
    linkedGroup: 'Summit Logistics LLC', rfpId: 7,
    dueDate: '2026-04-22', done: false, priority: 'high', assignedUW: 'SR',
  },
  {
    id: 4, text: 'DTQ case review — Blue Ridge Medical Group (SIC 7011)',
    linkedGroup: 'Blue Ridge Medical Group', rfpId: 5,
    dueDate: '2026-04-21', done: false, priority: 'high', assignedUW: 'VC',
  },
  {
    id: 5, text: 'Confirm TPAC date with producer for Prairie Schools Cooperative',
    linkedGroup: 'Prairie Schools Cooperative', rfpId: 4,
    dueDate: '2026-04-25', done: false, priority: 'low', assignedUW: 'JM',
  },
  {
    id: 6, text: 'Complete setup for Valley Community Hospital',
    linkedGroup: 'Valley Community Hospital', rfpId: 8,
    dueDate: '2026-04-28', done: false, priority: 'medium', assignedUW: 'JM',
  },
  {
    id: 7, text: 'Rate action review completed for Meridian Health Partners',
    linkedGroup: 'Meridian Health Partners', rfpId: 3,
    dueDate: '2026-04-20', done: true, priority: 'medium', assignedUW: 'JM',
  },
  {
    id: 8, text: 'Handed off Cascade River Schools to implementation team',
    linkedGroup: 'Cascade River Schools', rfpId: 6,
    dueDate: '2026-04-20', done: true, priority: 'low', assignedUW: 'VC',
  },
];

// ─── Todo row ─────────────────────────────────────────────────────────────────

function TodoRow({ item, onToggle, onDelete, navigate }) {
  const days = differenceInCalendarDays(parseISO(item.dueDate), TODAY_DATE);
  const isOverdue = !item.done && days < 0;
  const isDueToday = !item.done && days === 0;
  const p = PRIORITY_STYLES[item.priority];

  return (
    <Stack direction="row" alignItems="flex-start" spacing={1.5}
      sx={{
        px: '16px', py: '14px', borderBottom: `1px solid ${C.divider}`,
        bgcolor: isOverdue ? '#fff8f7' : 'transparent',
        '&:last-child': { borderBottom: 'none' },
        '&:hover': { bgcolor: isOverdue ? '#fff0ee' : C.bgPage },
        transition: 'background 0.1s',
        opacity: item.done ? 0.55 : 1,
      }}>

      {/* Checkbox */}
      <Box onClick={() => onToggle(item.id)} sx={{ cursor: 'pointer', mt: '1px', flexShrink: 0 }}>
        {item.done
          ? <CheckCircleIcon sx={{ fontSize: 18, color: C.green }} />
          : <RadioButtonUncheckedIcon sx={{ fontSize: 18, color: C.darkGray }} />}
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography sx={{
          fontSize: '14px', color: item.done ? C.grayMid : C.black,
          textDecoration: item.done ? 'line-through' : 'none',
          lineHeight: 1.5, mb: '6px',
        }}>
          {item.text}
        </Typography>
        <Stack direction="row" alignItems="center" spacing={1} flexWrap="wrap" sx={{ gap: '6px' }}>
          {/* Priority */}
          <Box component="span" sx={{
            display: 'inline-flex', alignItems: 'center',
            px: '8px', py: '2px', borderRadius: '20px',
            fontSize: '11px', fontWeight: 500,
            bgcolor: p.bg, color: p.color, border: `1px solid ${p.border}`,
          }}>
            {p.label}
          </Box>

          {/* Linked RFP */}
          <Box component="span" onClick={() => navigate(`/rfp/${item.rfpId}`)}
            sx={{
              display: 'inline-flex', alignItems: 'center',
              px: '8px', py: '2px', borderRadius: '4px',
              fontSize: '12px', fontWeight: 400,
              bgcolor: C.blueLightBg, color: C.blueLight, border: `1px solid #b5d4f4`,
              cursor: 'pointer',
              '&:hover': { textDecoration: 'underline' },
            }}>
            {item.linkedGroup}
          </Box>

          {/* UW badge */}
          <Box component="span" sx={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: 22, height: 22, borderRadius: '50%',
            fontSize: '10px', fontWeight: 600,
            bgcolor: C.blueLightBg, color: C.blue,
          }}>
            {item.assignedUW}
          </Box>
        </Stack>
      </Box>

      {/* Due date */}
      <Stack alignItems="flex-end" spacing={0.5} sx={{ flexShrink: 0 }}>
        {!item.done && (
          <Box component="span" sx={{
            px: '8px', py: '2px', borderRadius: '4px', fontSize: '12px', fontWeight: 500,
            bgcolor:  isOverdue ? '#fdecea' : isDueToday ? '#fff3e0' : 'transparent',
            color:    isOverdue ? C.red     : isDueToday ? C.orange  : C.grayMid,
            border:   isOverdue ? '1px solid #f5c1c1' : isDueToday ? '1px solid #ffe0b2' : 'none',
          }}>
            {isOverdue ? 'Overdue' : isDueToday ? 'Due today' : format(parseISO(item.dueDate), 'MMM d')}
          </Box>
        )}
      </Stack>

      {/* Delete */}
      <IconButton size="small" onClick={() => onDelete(item.id)}
        sx={{ opacity: 0, '.MuiStack-root:hover &': { opacity: 1 }, p: '4px', color: C.grayMid, '&:hover': { color: C.red } }}>
        <DeleteOutlineIcon sx={{ fontSize: 16 }} />
      </IconButton>
    </Stack>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function TodoList() {
  const navigate = useNavigate();
  const [todos, setTodos]       = useState(INITIAL_TODOS);
  const [newText, setNewText]   = useState('');
  const [adding, setAdding]     = useState(false);
  const [filter, setFilter]     = useState('all');
  const [uwFilter, setUwFilter] = useState('All');

  const UW_OPTIONS = ['All', 'SR', 'JM', 'VC'];

  function toggleDone(id) {
    setTodos((prev) => prev.map((t) => t.id === id ? { ...t, done: !t.done } : t));
  }

  function deleteTodo(id) {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  }

  function addTodo() {
    if (!newText.trim()) return;
    setTodos((prev) => [{
      id: Date.now(), text: newText.trim(),
      linkedGroup: '', rfpId: null,
      dueDate: '2026-04-28', done: false, priority: 'medium', assignedUW: 'SR',
    }, ...prev]);
    setNewText('');
    setAdding(false);
  }

  const filtered = useMemo(() => todos.filter((t) => {
    if (filter === 'open' && t.done) return false;
    if (filter === 'done' && !t.done) return false;
    if (uwFilter !== 'All' && t.assignedUW !== uwFilter) return false;
    return true;
  }), [todos, filter, uwFilter]);

  const counts = useMemo(() => ({
    open:    todos.filter((t) => !t.done).length,
    overdue: todos.filter((t) => !t.done && differenceInCalendarDays(parseISO(t.dueDate), TODAY_DATE) < 0).length,
    done:    todos.filter((t) =>  t.done).length,
  }), [todos]);

  const groups = useMemo(() => {
    const overdue = filtered.filter((t) => !t.done && differenceInCalendarDays(parseISO(t.dueDate), TODAY_DATE) < 0);
    const today   = filtered.filter((t) => !t.done && differenceInCalendarDays(parseISO(t.dueDate), TODAY_DATE) === 0);
    const upcoming = filtered.filter((t) => !t.done && differenceInCalendarDays(parseISO(t.dueDate), TODAY_DATE) > 0);
    const done    = filtered.filter((t) => t.done);
    return [
      { label: 'Overdue', items: overdue, accent: C.red },
      { label: 'Due Today', items: today, accent: C.orange },
      { label: 'Upcoming', items: upcoming, accent: C.black },
      { label: 'Completed', items: done, accent: C.grayMid },
    ].filter((g) => g.items.length > 0);
  }, [filtered]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0 }}>

      {/* ── Page header ── */}
      <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: '20px' }}>
        <Stack spacing={0.5}>
          <Typography sx={{ fontSize: '20px', fontWeight: 600, color: C.black, lineHeight: 1 }}>
            To-do List
          </Typography>
          <Typography sx={{ fontSize: '13px', color: C.grayMid }}>
            {counts.open} open · {counts.overdue > 0 ? `${counts.overdue} overdue · ` : ''}{counts.done} completed
          </Typography>
        </Stack>
        <Button
          variant="contained"
          startIcon={<AddIcon sx={{ fontSize: '16px !important' }} />}
          onClick={() => setAdding(true)}
          sx={{ height: 36, px: 2, fontSize: '13px', fontWeight: 500, borderRadius: '6px', bgcolor: C.blueLight, boxShadow: 'none', '&:hover': { bgcolor: '#0e57a0', boxShadow: 'none' } }}>
          Add task
        </Button>
      </Stack>

      {/* ── New task input ── */}
      {adding && (
        <Paper elevation={0} sx={{ border: `1px solid ${C.blueLight}`, borderRadius: '8px', p: '16px', mb: '16px', bgcolor: C.bgPaper, boxShadow: '0 0 0 3px rgba(17,102,187,0.08)' }}>
          <TextField
            fullWidth autoFocus
            placeholder="Describe the task…"
            value={newText}
            onChange={(e) => setNewText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') addTodo();
              if (e.key === 'Escape') { setAdding(false); setNewText(''); }
            }}
            sx={{
              '& .MuiOutlinedInput-root': { fontSize: '14px', bgcolor: C.bgPaper },
              '& .MuiOutlinedInput-notchedOutline': { borderColor: C.divider },
            }}
          />
          <Stack direction="row" spacing={1} sx={{ mt: '10px' }}>
            <Button variant="contained" size="small" onClick={addTodo}
              sx={{ height: 32, px: 2, fontSize: '13px', borderRadius: '6px', bgcolor: C.blueLight, boxShadow: 'none' }}>
              Add
            </Button>
            <Button size="small" onClick={() => { setAdding(false); setNewText(''); }}
              sx={{ height: 32, px: 2, fontSize: '13px', borderRadius: '6px', border: `1px solid ${C.divider}`, color: '#28313e', boxShadow: 'none' }}>
              Cancel
            </Button>
          </Stack>
        </Paper>
      )}

      {/* ── Filter bar ── */}
      <Stack direction="row" alignItems="center" spacing={0} sx={{ mb: '16px', gap: '6px' }}>
        {[
          { key: 'all', label: 'All' },
          { key: 'open', label: 'Open' },
          { key: 'done', label: 'Completed' },
        ].map(({ key, label }) => (
          <Box key={key} component="button" onClick={() => setFilter(key)}
            sx={{
              display: 'inline-flex', alignItems: 'center', px: '14px', height: 32,
              borderRadius: '20px', border: `1px solid ${filter === key ? C.blueLight : C.divider}`,
              bgcolor: filter === key ? C.blueLightBg : '#fcfcfc',
              color: filter === key ? C.blue : '#28313e',
              fontSize: '13px', fontWeight: filter === key ? 500 : 400,
              cursor: 'pointer', outline: 'none', whiteSpace: 'nowrap',
              '&:hover': { borderColor: C.blueLight, bgcolor: C.blueLightBg, color: C.blue },
            }}>
            {label}
          </Box>
        ))}

        <Box sx={{ width: '10px' }} />

        <Select value={uwFilter} onChange={(e) => setUwFilter(e.target.value)}
          variant="outlined" size="small"
          sx={{
            height: 32, borderRadius: '20px', fontSize: '13px',
            fontWeight: uwFilter !== 'All' ? 500 : 400,
            color: uwFilter !== 'All' ? C.blue : '#28313e',
            bgcolor: uwFilter !== 'All' ? C.blueLightBg : '#fcfcfc',
            '& .MuiOutlinedInput-notchedOutline': { borderColor: uwFilter !== 'All' ? C.blueLight : C.divider },
            '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: C.blueLight },
            '& .MuiSelect-select': { py: 0, pl: 1.75, pr: '28px !important', display: 'flex', alignItems: 'center', height: '32px' },
          }}
          MenuProps={{ PaperProps: { sx: { borderRadius: '8px', border: `1px solid ${C.divider}`, boxShadow: '0 4px 16px rgba(0,0,0,0.08)', mt: 0.5 } } }}>
          {UW_OPTIONS.map((opt) => (
            <MenuItem key={opt} value={opt} sx={{ fontSize: '13px' }}>
              {opt === 'All' ? 'All UW' : opt}
            </MenuItem>
          ))}
        </Select>
      </Stack>

      {/* ── Task groups ── */}
      {groups.length === 0 ? (
        <Paper elevation={0} sx={{ border: `1px solid ${C.divider}`, borderRadius: '8px', p: '48px 24px', bgcolor: C.bgPaper, textAlign: 'center', boxShadow: 'none' }}>
          <Box sx={{ width: 40, height: 40, borderRadius: '50%', bgcolor: C.bgBaseGray, mx: 'auto', mb: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CheckCircleIcon sx={{ fontSize: 20, color: C.grayMid }} />
          </Box>
          <Typography sx={{ fontSize: '14px', fontWeight: 500, color: C.black, mb: 0.5 }}>All clear</Typography>
          <Typography sx={{ fontSize: '13px', color: C.grayMid }}>No tasks match the current filters.</Typography>
        </Paper>
      ) : (
        <Stack spacing={0} sx={{ gap: '16px' }}>
          {groups.map((group) => (
            <Box key={group.label}>
              <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: '8px' }}>
                <Typography sx={{ fontSize: '11px', fontWeight: 500, color: group.accent, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  {group.label}
                </Typography>
                <Box component="span" sx={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', minWidth: 18, height: 18, borderRadius: '9px', bgcolor: '#f1f1f1', color: C.grayMid, fontSize: '11px', fontWeight: 600, px: '5px' }}>
                  {group.items.length}
                </Box>
              </Stack>
              <Paper elevation={0} sx={{ border: `1px solid ${C.divider}`, borderRadius: '8px', overflow: 'hidden', bgcolor: C.bgPaper, boxShadow: 'none' }}>
                {group.items.map((item) => (
                  <TodoRow key={item.id} item={item} onToggle={toggleDone} onDelete={deleteTodo} navigate={navigate} />
                ))}
              </Paper>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
}
