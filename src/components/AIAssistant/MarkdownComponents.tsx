import { Box, Paper, Typography, TableContainer, Table, TableHead, TableBody, TableRow, TableCell, Divider } from "@mui/material";
import { useTheme } from "@mui/material/styles";

export const MarkdownComponents = () => {
  const theme = useTheme();

  return {
    p: ({ children }: any) => <Typography variant="body2" sx={{ mb: 1.5, lineHeight: 1.8 }}>{children}</Typography>,
    h1: ({ children }: any) => <Typography variant="h5" sx={{ fontWeight: 'bold', mt: 2, mb: 1.5 }}>{children}</Typography>,
    h2: ({ children }: any) => <Typography variant="h6" sx={{ fontWeight: 'bold', mt: 2, mb: 1.5 }}>{children}</Typography>,
    h3: ({ children }: any) => <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mt: 1.5, mb: 1 }}>{children}</Typography>,
    ul: ({ children }: any) => <Box component="ul" sx={{ pl: 3, mb: 1.5 }}>{children}</Box>,
    ol: ({ children }: any) => <Box component="ol" sx={{ pl: 3, mb: 1.5 }}>{children}</Box>,
    li: ({ children }: any) => <Box component="li" sx={{ mb: 0.5 }}><Typography variant="body2" component="span">{children}</Typography></Box>,
    strong: ({ children }: any) => <Box component="span" sx={{ fontWeight: 'bold', color: 'primary.main' }}>{children}</Box>,
    em: ({ children }: any) => <Box component="em" sx={{ fontStyle: 'italic' }}>{children}</Box>,
    code: ({ inline, children }: any) => {
      if (inline) {
        return <Box component="code" sx={{
          px: 0.5, py: 0.25, borderRadius: 0.5,
          bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.200',
          color: 'secondary.main', fontSize: '0.875em', fontFamily: 'monospace'
        }}>{children}</Box>;
      }
      return <Paper elevation={0} sx={{
        p: 2, my: 1.5, bgcolor: theme.palette.mode === 'dark' ? 'grey.900' : 'grey.100', borderRadius: 1, overflow: 'auto'
      }}><Box component="pre" sx={{ margin: 0, fontFamily: 'monospace', fontSize: '0.875rem', lineHeight: 1.5 }}><code>{children}</code></Box></Paper>;
    },
    blockquote: ({ children }: any) => <Paper elevation={0} sx={{
      borderLeft: 4, borderColor: 'primary.main', pl: 2, py: 1, my: 1.5,
      bgcolor: theme.palette.mode === 'dark' ? 'grey.800' : 'grey.50'
    }}>{children}</Paper>,
    table: ({ children }: any) => <TableContainer component={Paper} elevation={0} sx={{ my: 2 }}><Table size="small">{children}</Table></TableContainer>,
    thead: ({ children }: any) => <TableHead>{children}</TableHead>,
    tbody: ({ children }: any) => <TableBody>{children}</TableBody>,
    tr: ({ children }: any) => <TableRow>{children}</TableRow>,
    th: ({ children }: any) => <TableCell sx={{ fontWeight: 'bold' }}>{children}</TableCell>,
    td: ({ children }: any) => <TableCell>{children}</TableCell>,
    hr: () => <Divider sx={{ my: 2 }} />,
    a: ({ href, children }: any) => <Box component="a" href={href} target="_blank" rel="noopener noreferrer" sx={{ color: 'primary.main', textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}>{children}</Box>
  };
};
