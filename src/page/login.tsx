import { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useAtom } from "jotai";
import { titleAtom } from "../utils/store";
import { getCurrentWindow } from "@tauri-apps/api/window";
import { Box, Button, TextField, Paper, Typography, useTheme } from "@mui/material";
import TextType from "../components/TextType/TextType";
import { invoke } from "@tauri-apps/api/core";
import { toast } from "sonner";

export default function Login() {
  const [_title, setTitle] = useAtom(titleAtom);
  const navigate = useNavigate();
  const theme = useTheme();
  const [privateKey, setPrivateKey] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    async function checkLoginStatus() {
      try {
        const publicKey: string = await invoke("get_public_key");
        if (publicKey) {
          navigate("/admin", { replace: true });
        }
      } catch (error) {
        toast.error("登录失败，请重试");
      }
    }

    setTitle("Login");
    checkLoginStatus();

    return () => setTitle("");
  }, [setTitle, navigate]);

  const handleLogin = async () => {
    if (!privateKey.trim()) {
      toast.error("请输入私钥");
      return;
    }

    setIsLoading(true);
    const currentWindow = getCurrentWindow();

    try {
      const res = await invoke("set_private_key", { secretBase58: privateKey });

      if (res === "Error") {
        toast.error("错误: 无效的私钥");
        return;
      }

      toast.success("登录成功");
      await currentWindow.setTitle("Admin");
      navigate("/admin", { replace: true });
    } catch (error) {
      toast.error("登录失败，请重试");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleLogin();
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        overflow: "hidden",
        backgroundColor: "background.default"
      }}
    >
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          p: 2
        }}
      >
        <Paper
          elevation={4}
          sx={{
            p: { xs: 3, sm: 4 },
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            width: "100%",
            maxWidth: 450,
            borderRadius: 3,
            boxSizing: "border-box"
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

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{ mb: 4, textAlign: "center" }}
          >
            使用您的私钥访问账户
          </Typography>

          <TextField
            label="私钥"
            variant="outlined"
            type="password"
            fullWidth
            sx={{ mb: 3 }}
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleKeyPress(e);
              }
            }}
            disabled={isLoading}
            placeholder="请输入您的私钥"
          />


          <Box sx={{ display: "flex", gap: 2, width: "100%", mt: 1 }}>
            <Button
              variant="contained"
              color="secondary"
              fullWidth
              disabled={isLoading}
              sx={{
                py: 1.5,
                fontWeight: "bold",
                fontSize: "1rem",
                textTransform: "none",
              }}
              onClick={() => navigate("/dashboard", { replace: true })}
            >
              暂不登录
            </Button>
            <Button
              variant="contained"
              color="primary"
              fullWidth
              disabled={isLoading}
              sx={{
                py: 1.5,
                fontWeight: "bold",
                fontSize: "1rem",
                textTransform: "none",
                "&:hover": {
                  boxShadow: `0 5px 15px ${theme.palette.primary.main}60`
                }
              }}
              onClick={handleLogin}
            >
              {isLoading ? "登录中..." : "登录"}
            </Button>
          </Box>
        </Paper>
      </Box>
    </Box>
  );
}