import React from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <Box
      component="footer"
      sx={{
        py: 3,
        backgroundColor: (theme) => theme.palette.grey[100],
        borderTop: '1px solid',
        borderColor: 'divider',
      }}
    >
      <Container maxWidth="lg">
        <Box sx={{ textAlign: "center" }}>
          <Typography variant="body2" color="text.secondary" align="center">
            © {currentYear} AI 기반 SNS 이벤트기획 제안 시스템
          </Typography>
        </Box>
      </Container>
    </Box>
  );
};

export default Footer; 