import { Chip } from '@mui/material';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import { statusChipStyles } from '../../theme/theme';

export default function StatusChip({ status, size = 'small' }) {
  const style = statusChipStyles[status] ?? { bg: '#F1EFE8', color: '#5F5E5A' };
  const isHandedOff = status === 'Handed Off';

  return (
    <Chip
      label={status}
      size={size}
      icon={isHandedOff ? <LockOutlinedIcon sx={{ fontSize: '12px !important', color: `${style.color} !important` }} /> : undefined}
      sx={{
        backgroundColor: style.bg,
        color: style.color,
        fontWeight: 500,
        fontSize: '12px',
        height: 24,
        borderRadius: '20px',
        '& .MuiChip-label': { px: isHandedOff ? 0.5 : 1.5 },
      }}
    />
  );
}
