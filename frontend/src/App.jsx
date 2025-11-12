import React, { lazy, Suspense } from 'react';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box, CircularProgress } from '@mui/material';
import { motion } from 'framer-motion';
import { AppProvider } from './modules/shared/AppContext';
import ParticleBackground from './components/ParticleBackground';

// Lazy load modules for better performance
const ChatModule = lazy(() => import('./modules/chatbot/ChatModule'));
const AvatarModule = lazy(() => import('./modules/avatar/AvatarModule'));

const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#6366f1', // Indigo
      light: '#818cf8',
      dark: '#4f46e5',
    },
    secondary: {
      main: '#ec4899', // Pink
      light: '#f472b6',
      dark: '#db2777',
    },
    background: {
      default: '#0f172a', // Slate 900
      paper: '#1e293b', // Slate 800
    },
    text: {
      primary: '#f1f5f9',
      secondary: '#cbd5e1',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 700,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
    button: {
      textTransform: 'none',
      fontWeight: 500,
    },
  },
  shape: {
    borderRadius: 12,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          padding: '8px 16px',
          fontWeight: 500,
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

// Loading component with animation
const LoadingFallback = () => (
  <Box 
    sx={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      height: '100%' 
    }}
    component={motion.div}
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.3 }}
  >
    <CircularProgress />
  </Box>
);

function App() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <AppProvider>
        <Box
          component={motion.div}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
          sx={{
            display: 'flex',
            height: '100vh',
            width: '100vw',
            overflow: 'hidden',
            position: 'relative',
          }}
        >
          {/* Particle Background */}
          <ParticleBackground />

          {/* Avatar Module - Independent */}
          <Box
            component={motion.div}
            initial={{ x: -50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            sx={{
              flex: 1,
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
              background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)',
              overflow: 'hidden',
              zIndex: 1,
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'radial-gradient(circle at 20% 50%, rgba(99, 102, 241, 0.1) 0%, transparent 50%)',
                pointerEvents: 'none',
              },
            }}
          >
            <Suspense fallback={<LoadingFallback />}>
              <AvatarModule />
            </Suspense>
          </Box>

          {/* Chat Module - Independent */}
          <Box
            component={motion.div}
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
            sx={{
              width: 420,
              display: 'flex',
              flexDirection: 'column',
              borderLeft: '1px solid rgba(99, 102, 241, 0.2)',
              backgroundColor: 'background.paper',
              boxShadow: '-4px 0 24px rgba(0, 0, 0, 0.3)',
              position: 'relative',
              zIndex: 1,
              '&::before': {
                content: '""',
                position: 'absolute',
                left: 0,
                top: 0,
                bottom: 0,
                width: '1px',
                background: 'linear-gradient(to bottom, transparent, rgba(99, 102, 241, 0.5), transparent)',
              },
            }}
          >
            <Suspense fallback={<LoadingFallback />}>
              <ChatModule />
            </Suspense>
          </Box>
        </Box>
      </AppProvider>
    </ThemeProvider>
  );
}

export default App;