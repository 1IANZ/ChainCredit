import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAtom } from "jotai";
import { titleAtom } from "../utils/store";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Box, Button, TextField, Paper, Typography, useTheme, Card, CardContent, CardHeader } from "@mui/material";
import TextType from "../components/TextType/TextType";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";

export default function Login() {
  const [_title, setTitle] = useAtom(titleAtom);
  const navigate = useNavigate();
  const theme = useTheme();
  const [privateKey, setPrivateKey] = useState<string>("");
  const [publicKey, setPublicKey] = useState<string>("");

  useEffect(() => {
    async function fetchPublicKey() {
      const res: string = await invoke("get_public_key");
      setPublicKey(res);
    }

    setTitle("Login");
    fetchPublicKey();

    return () => setTitle("");
  }, [setTitle]);

  const handleLogin = async () => {
    const currentWindow = getCurrentWindow();
    try {
      const res = await invoke("set_private_key", { secretBase58: privateKey });
      if (res === "Error") {
        toast.error("错误: 无效的私钥");
        return;
      }
      await currentWindow.setTitle("Main");
      navigate("/dashboard");
    } catch (error) {
      console.error("Failed to update window or navigate:", error);
    }
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "calc(100vh - 64px)", overflow: "hidden" }}>
      <Box sx={{ flexGrow: 1, display: "flex", alignItems: "center", justifyContent: "center", backgroundColor: "background.default", p: 2 }}>
        <Paper elevation={4} sx={{ p: { xs: 3, sm: 4 }, display: "flex", flexDirection: "column", alignItems: "center", width: "100%", maxWidth: 450, borderRadius: 3, boxSizing: "border-box" }}>
          <TextType text={["CHAIN CREDIT", "LOGIN"]} as="h1" typingSpeed={75} pauseDuration={1500} showCursor={true} cursorCharacter="|" textColors={[theme.palette.primary.main, theme.palette.secondary.main]} />
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: "center" }}>
            Access your account with your private key.
          </Typography>
          <Button
            variant="text"
            color="primary"
            fullWidth
            sx={{ mb: 3 }}
            onClick={handleGoBack}
          >
            返回
          </Button>
          {publicKey ? (
            <Card sx={{ width: "100%", mb: 3 }}>
              <CardHeader title="Logged In" />
              <CardContent>
                <Typography variant="body1" color="text.primary">
                  Your public key is:
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ wordBreak: "break-all", mt: 1 }}>
                  {publicKey}
                </Typography>
              </CardContent>
            </Card>
          ) : (
            <>
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
                sx={{ py: 1.5, fontWeight: "bold", fontSize: "1rem", textTransform: "none", mt: 2, "&:hover": { boxShadow: `0 5px 15px ${theme.palette.primary.main}60` } }}
                onClick={handleLogin}
              >
                私钥登录
              </Button>
            </>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
