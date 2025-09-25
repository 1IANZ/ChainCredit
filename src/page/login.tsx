import { Box, Button, TextField, Paper, Typography, useTheme } from "@mui/material";
import TextType from "../components/TextType/TextType";
import TitleBar from "../components/TitleBar";
import { useState } from "react";
import { useNavigate } from "react-router";
import { getCurrentWindow } from "@tauri-apps/api/window";

export default function Login() {
  const navigate = useNavigate();
  const theme = useTheme();
  const [privateKey, setPrivateKey] = useState<string>("");
  const handleLogin = async () => {

    handleDirectEnter()
  };
  const handleDirectEnter = async () => {
    const currentWindow = getCurrentWindow();
    try {
      await currentWindow.setSize(new (await import('@tauri-apps/api/window')).LogicalSize(900, 650));
      await currentWindow.center();
      await currentWindow.setTitle("Main");
      navigate('/main');
    } catch (error) {
      console.error("Failed to update window or navigate:", error);
    }
  };


  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
      <TitleBar title="LOGIN" data-tauri-drag-region />
      <Box
        sx={{
          flexGrow: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'background.default',
          p: 2,
        }}
      >

        <Paper
          elevation={4}
          sx={{
            p: { xs: 3, sm: 4 },
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            maxWidth: 450,
            borderRadius: 3,
            boxSizing: 'border-box',
          }}
        >
          <TextType
            text={["CHAIN CREDIT", "LOGIN"]}
            as="h1"
            typingSpeed={75}
            pauseDuration={1500}
            showCursor={true}
            cursorCharacter="|"
            textColors={[theme.palette.primary.main, theme.palette.secondary.main]}
          />
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
            Access your account with your private key.
          </Typography>
          <TextField
            label="Private Key"
            variant="outlined"
            type="password"
            fullWidth
            sx={{ mb: 3 }}
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              py: 1.5,
              fontWeight: 'bold',
              fontSize: '1rem',
              textTransform: 'none',
              mt: 2,
              '&:hover': {
                boxShadow: `0 5px 15px ${theme.palette.primary.main}60`,
              }
            }}
            onClick={handleLogin}
          >
            私钥登录
          </Button>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              py: 1.5,
              fontWeight: 'bold',
              fontSize: '1rem',
              textTransform: 'none',
              mt: 2,
              '&:hover': {
                boxShadow: `0 5px 15px ${theme.palette.primary.main}60`,
              }
            }}
            onClick={handleDirectEnter}
          >
            直接进入
          </Button>
        </Paper>
      </Box>
    </Box >
  );
}