import { useContext } from 'react';
import { IconButton, useTheme } from '@mui/material';

import SunnyIcon from '@mui/icons-material/Sunny';
import BedtimeIcon from '@mui/icons-material/Bedtime';
import { ColorModeContext } from './ThemeContext';

export default function ModeToggle() {

  const theme = useTheme();

  const colorMode = useContext(ColorModeContext);

  return (
    <IconButton
      sx={{ ml: 1 }}
      onClick={colorMode.toggleColorMode}
    >
      {theme.palette.mode === 'dark' ? (
        <SunnyIcon />
      ) : (
        <BedtimeIcon />
      )}
    </IconButton>
  );
}