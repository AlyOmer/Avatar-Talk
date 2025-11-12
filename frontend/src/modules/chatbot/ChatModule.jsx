import React, { useState, useRef, useEffect } from 'react';
import {
  Box,
  TextField,
  Button,
  IconButton,
  Typography,
  Paper,
  List,
  ListItem,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Switch,
  FormControlLabel,
  Divider,
} from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import SendIcon from '@mui/icons-material/Send';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAppContext } from '../shared/AppContext';
import { chatbotAPI, avatarAPI } from '../../services/api';

const ChatModule = () => {
  const {
    messages,
    addMessage,
    clearMessages,
    speak,
    settings,
    updateSettings,
  } = useAppContext();

  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState('');
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');

    // Add user message
    addMessage({
      role: 'user',
      content: userMessage,
    });

    setIsLoading(true);

    try {
      // Query chatbot
      const response = await chatbotAPI.query(
        userMessage,
        settings.provider,
        settings.useRag
      );

      // Add bot response
      addMessage({
        role: 'assistant',
        content: response.response,
        contextUsed: response.context_used,
      });

      // If auto-speak is enabled, trigger avatar (async to not block chat)
      if (settings.autoSpeak) {
        // Don't await - let speech generation happen in background
        avatarAPI.speak(response.response)
          .then(speechData => {
            console.log('✅ Speech data received:', {
              hasAudio: !!speechData.audio_base64,
              audioLength: speechData.audio_base64?.length || 0,
              hasVisemes: !!speechData.visemes,
              visemeCount: speechData.visemes?.length || 0,
              duration: speechData.duration
            });
            
            if (!speechData.audio_base64) {
              console.error('❌ No audio data in response:', speechData);
              return;
            }
            
            speak(response.response, speechData.audio_base64, speechData.visemes);
          })
          .catch(error => {
            console.error('❌ Speech generation failed:', error);
            if (error.response) {
              console.error('Error response:', error.response.data);
              // Show user-friendly error message
              const errorDetail = error.response.data?.detail || error.response.data?.message || 'Unknown error';
              if (typeof errorDetail === 'object') {
                console.error('Error details:', errorDetail);
              }
            }
            // Chat still works even if speech fails
          });
      }
    } catch (error) {
      console.error('Error querying chatbot:', error);
      let errorMessage = 'Failed to get response. Check console for details.';
      
      if (error.response) {
        // Server responded with error
        const errorDetail = error.response.data?.detail || error.response.data?.message || 'Unknown server error';
        errorMessage = `Server error: ${errorDetail}`;
        console.error('Server error details:', error.response.data);
      } else if (error.request) {
        // Request made but no response
        errorMessage = 'No response from server. Is the backend running?';
        console.error('No response received:', error.request);
      } else {
        // Error setting up request
        errorMessage = `Request error: ${error.message}`;
        console.error('Request setup error:', error.message);
      }
      
      addMessage({
        role: 'error',
        content: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;

    setUploadStatus('Uploading...');

    try {
      const result = await chatbotAPI.uploadDocuments(files);
      setUploadStatus(`Uploaded ${files.length} file(s). Added ${result.chunks_added} chunks.`);
      setTimeout(() => setUploadStatus(''), 3000);
    } catch (error) {
      console.error('Error uploading files:', error);
      setUploadStatus('Upload failed');
      setTimeout(() => setUploadStatus(''), 3000);
    }

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleClearDocuments = async () => {
    try {
      await chatbotAPI.clearDocuments();
      setUploadStatus('Documents cleared');
      setTimeout(() => setUploadStatus(''), 2000);
    } catch (error) {
      console.error('Error clearing documents:', error);
    }
  };

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        p: 3,
        background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.95) 0%, rgba(15, 23, 42, 0.98) 100%)',
      }}
    >
      {/* Header */}
      <Box 
        component={motion.div}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        sx={{ 
          mb: 3,
          pb: 2,
          borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
        }}
      >
        <Typography 
          variant="h5" 
          gutterBottom
          component={motion.h5}
          animate={{
            backgroundPosition: ['0%', '100%', '0%'],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: 'linear',
          }}
          sx={{
            fontWeight: 700,
            background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 50%, #6366f1 100%)',
            backgroundSize: '200% 100%',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
          }}
        >
          AI Chat
        </Typography>

        {/* Settings */}
        <Box sx={{ mb: 1 }}>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
            Using: Gemini API
          </Typography>

          <FormControlLabel
            control={
              <Switch
                checked={settings.autoSpeak}
                onChange={(e) => updateSettings({ autoSpeak: e.target.checked })}
              />
            }
            label="Auto-speak"
          />
        </Box>

        {/* Document Upload - Icon Only */}
        <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center', justifyContent: 'flex-end' }}>
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept=".pdf,.txt,.docx"
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />
          <IconButton
            size="small"
            onClick={() => fileInputRef.current?.click()}
            title="Upload Documents"
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'primary.main',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <UploadFileIcon fontSize="small" />
          </IconButton>
          <IconButton
            size="small"
            onClick={handleClearDocuments}
            title="Clear documents"
            sx={{
              color: 'text.secondary',
              '&:hover': {
                color: 'error.main',
                backgroundColor: 'rgba(239, 68, 68, 0.1)',
                transform: 'scale(1.1)',
              },
              transition: 'all 0.2s ease',
            }}
          >
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>

        {uploadStatus && (
          <Typography variant="caption" color="primary" sx={{ mt: 1, display: 'block' }}>
            {uploadStatus}
          </Typography>
        )}
      </Box>

      <Divider sx={{ mb: 2 }} />

      {/* Messages */}
      <Box
        sx={{
          flex: 1,
          overflowY: 'auto',
          mb: 2,
        }}
      >
        <List>
          <AnimatePresence>
            {messages.map((message, index) => (
              <ListItem
                key={message.id}
                component={motion.li}
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                transition={{ 
                  duration: 0.3, 
                  delay: index * 0.05,
                  ease: 'easeOut'
                }}
                sx={{
                  flexDirection: 'column',
                  alignItems: message.role === 'user' ? 'flex-end' : 'flex-start',
                  mb: 1,
                }}
              >
                <Paper
                  component={motion.div}
                  whileHover={{ 
                    y: -2,
                    transition: { duration: 0.2 }
                  }}
                  sx={{
                    p: 2,
                    maxWidth: '85%',
                    backgroundColor:
                      message.role === 'user'
                        ? 'linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)'
                        : message.role === 'error'
                        ? 'rgba(239, 68, 68, 0.2)'
                        : 'rgba(30, 41, 59, 0.8)',
                    backdropFilter: 'blur(10px)',
                    border: message.role === 'user' 
                      ? '1px solid rgba(99, 102, 241, 0.3)'
                      : '1px solid rgba(255, 255, 255, 0.1)',
                    borderRadius: 2,
                    boxShadow: message.role === 'user'
                      ? '0 4px 12px rgba(99, 102, 241, 0.3)'
                      : '0 2px 8px rgba(0, 0, 0, 0.2)',
                  }}
                >
                  <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                    {message.content}
                  </Typography>
                  {message.contextUsed && (
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        mt: 1, 
                        display: 'block',
                        color: 'primary.light',
                        fontSize: '0.7rem',
                      }}
                    >
                      📚 Used RAG context
                    </Typography>
                  )}
                </Paper>
              </ListItem>
            ))}
          </AnimatePresence>
          <div ref={messagesEndRef} />
        </List>
      </Box>

      {/* Input */}
      <Box 
        component={motion.div}
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, delay: 0.3 }}
        sx={{ 
          display: 'flex', 
          gap: 1.5,
          pt: 2,
          borderTop: '1px solid rgba(99, 102, 241, 0.2)',
        }}
      >
        <TextField
          fullWidth
          multiline
          maxRows={4}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          disabled={isLoading}
          size="small"
          sx={{
            '& .MuiOutlinedInput-root': {
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              backdropFilter: 'blur(10px)',
              borderRadius: 2,
              '& fieldset': {
                borderColor: 'rgba(99, 102, 241, 0.3)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(99, 102, 241, 0.5)',
              },
              '&.Mui-focused fieldset': {
                borderColor: 'primary.main',
                borderWidth: '2px',
              },
            },
            '& .MuiInputBase-input': {
              color: 'text.primary',
            },
          }}
        />
        <IconButton
          component={motion.button}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          color="primary"
          onClick={handleSend}
          disabled={isLoading || !input.trim()}
          sx={{
            backgroundColor: 'primary.main',
            color: 'white',
            width: 48,
            height: 48,
            '&:hover': {
              backgroundColor: 'primary.dark',
            },
            '&:disabled': {
              backgroundColor: 'rgba(99, 102, 241, 0.3)',
            },
            transition: 'all 0.2s',
          }}
        >
          {isLoading ? <CircularProgress size={24} color="inherit" /> : <SendIcon />}
        </IconButton>
      </Box>

      <AnimatePresence>
        {messages.length > 0 && (
          <Button
            component={motion.button}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            size="small"
            onClick={clearMessages}
            sx={{ 
              mt: 1,
              alignSelf: 'flex-start',
            }}
          >
            Clear Chat
          </Button>
        )}
      </AnimatePresence>
    </Box>
  );
};

export default ChatModule;


