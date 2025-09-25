import { AppBar, Toolbar, Typography, Box, IconButton, useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { getCurrentWindow, Window } from '@tauri-apps/api/window';
import { UnlistenFn } from '@tauri-apps/api/event';
import CloseIcon from '@mui/icons-material/Close';
import RemoveIcon from '@mui/icons-material/Remove';
import ModeToggle from './ModeToggle';
import CropFreeIcon from '@mui/icons-material/CropFree';
import FullscreenExitIcon from '@mui/icons-material/FullscreenExit';
interface TitleBarProps {
  title: string;
}

export default function TitleBar({ title }: TitleBarProps) {
  const theme = useTheme();
  const [appWindow, setAppWindow] = useState<Window | null>(null);
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    const win = getCurrentWindow();
    setAppWindow(win);

    let unlisten: UnlistenFn | undefined;
    const setupListeners = async () => {
      setIsMaximized(await win.isMaximized());
      unlisten = await win.onResized(async () => {
        setIsMaximized(await win.isMaximized());
      });
    };
    setupListeners();
    return () => { unlisten?.(); };
  }, []);

  const handleMinimize = () => appWindow?.minimize();
  const handleMaximize = () => appWindow?.toggleMaximize();
  const handleClose = () => appWindow?.close();

  const circularButtonStyle = {
    width: 36,
    height: 36,
    color: 'text.secondary',
    transition: 'background-color 0.2s ease-in-out',
    '&:hover': {
      backgroundColor: theme.palette.action.hover,
    },
  };

  return (
    <AppBar
      position="static"
      color="transparent"
      elevation={0}
      sx={{
        WebkitAppRegion: 'drag',
        userSelect: 'none',
        backgroundColor: 'rgba(0, 0, 0, 0)',
        backdropFilter: 'blur(20px) saturate(180%)',
        WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      }}
      data-tauri-drag-region
    >
      <Toolbar
        variant="dense"
        disableGutters
        sx={{
          minHeight: '48px !important',
          px: 1,
        }}
      >
        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', ml: 1 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            {title}
          </Typography>
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, WebkitAppRegion: 'no-drag' }}>
          <ModeToggle />
          <IconButton onClick={handleMinimize} sx={circularButtonStyle}>
            <RemoveIcon />
          </IconButton>
          <IconButton onClick={handleMaximize} sx={circularButtonStyle}>
            {isMaximized ? (
              <FullscreenExitIcon />
            ) : (
              <CropFreeIcon />
            )}
          </IconButton>
          <IconButton
            onClick={handleClose}
            sx={{ circularButtonStyle }}
          >
            <CloseIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
}