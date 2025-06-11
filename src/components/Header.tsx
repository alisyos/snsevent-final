import React from 'react';
import { Link as RouterLink, useLocation } from 'react-router-dom';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Button from '@mui/material/Button';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import HomeIcon from '@mui/icons-material/Home';

const Header: React.FC = () => {
  const location = useLocation();
  const isAdminPage = location.pathname === '/admin';

  return (
    <AppBar 
      position="static" 
      color="primary" 
      elevation={0}
      sx={{ 
        mb: 4,
        background: 'linear-gradient(90deg, #3f51b5 0%, #536dfe 100%)',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ py: 1.5 }}>
          <Typography 
            variant="h5" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 600,
              letterSpacing: '0.5px',
              textAlign: 'center',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}
          >
            <RouterLink to="/" style={{ color: 'white', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
              <AutoAwesomeIcon sx={{ mr: 1.5, fontSize: 28 }} />
              <Box>
                <Typography variant="h5" component="div" sx={{ fontWeight: 600, letterSpacing: '0.5px' }}>
                  SNS 이벤트 기획 AI
                </Typography>
                <Typography variant="caption" sx={{ opacity: 0.9, fontSize: '0.8rem' }}>
                  AI가 제안하는 맞춤형 이벤트 기획안을 확인하세요
                </Typography>
              </Box>
            </RouterLink>
          </Typography>
          
          {isAdminPage ? (
            <Button 
              component={RouterLink} 
              to="/" 
              color="inherit" 
              startIcon={<HomeIcon />}
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                '&:hover': { 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)' 
                },
                borderRadius: 2,
                px: 2
              }}
            >
              사용자 페이지
            </Button>
          ) : (
            <Button 
              component={RouterLink} 
              to="/admin" 
              color="inherit" 
              startIcon={<AdminPanelSettingsIcon />}
              sx={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.1)', 
                '&:hover': { 
                  backgroundColor: 'rgba(255, 255, 255, 0.2)' 
                },
                borderRadius: 2,
                px: 2
              }}
            >
              관리자
            </Button>
          )}
        </Toolbar>
      </Container>
    </AppBar>
  );
};

export default Header; 