import { AppBar, Toolbar, Typography, Box } from '@mui/material';
import ModeToggle from './ModeToggle';
interface TitleBarProps {
  title: string;
}

export default function TitleBar({ title }: TitleBarProps) {
  return (
    <AppBar position="static">
      <Toolbar>
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center' }}>
          <Typography
            variant="h6"
            component="div"
            noWrap
            sx={{
              fontWeight: 600,
              letterSpacing: '0.05em',
            }}
          >
            {title}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <ModeToggle />
        </Box>
      </Toolbar>
    </AppBar >
  );
}