import { Box, Button, TextField, Paper, Typography } from "@mui/material";
import TextType from "../components/TextType/TextType";
import TitleBar from "../components/TitleBar";

export default function Login() {
  return (
    <>
      <TitleBar title="LOGIN" data-tauri-drag-regio />

      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "calc(100vh - 50px)",
        }
        }
      >
        <Paper
          elevation={10}
          sx={{
            padding: 5,
            borderRadius: 2,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: { xs: '90%', sm: 500 },
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)',
          }}
        >
          <TextType
            text={["CHAIN CREDIT", "LOGIN"]}
            as="h1"
            typingSpeed={75}
            pauseDuration={1500}
            showCursor={true}
            cursorCharacter="|"
            textColors={["#1976d2", "#43a047"]}
          />
          <Typography variant="subtitle2" color="textSecondary" sx={{ mb: 4 }}>
            Access your account with your private key.
          </Typography>
          <TextField
            label="Private Key"
            variant="outlined"
            type="password"
            fullWidth
            sx={{ mb: 3 }}
          />
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{
              padding: '12px 0',
              fontWeight: 'bold',
              fontSize: '1rem',
              '&:hover': {
                boxShadoxw: '0 5px 15px rgba(25, 118, 210, 0.4)',
              }
            }}
          >
            L O G I N
          </Button>
        </Paper>
      </Box >
    </>
  )
}