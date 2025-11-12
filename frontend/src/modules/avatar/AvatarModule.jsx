import React, { useEffect, useRef, useState } from 'react';
import { Box, Typography, Paper, LinearProgress, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppContext } from '../shared/AppContext';
import OldManAvatar from './OldManAvatar';
import LatemanAvatar from './LatemanAvatar';

const AvatarModule = () => {
  const { currentSpeech, isSpeaking, updateSpeakingState } = useAppContext();
  const [visemeIndex, setVisemeIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [audioTime, setAudioTime] = useState(0);
  const [audioDuration, setAudioDuration] = useState(0);
  const [avatarType, setAvatarType] = useState('lateman'); // 'oldman' or 'lateman'
  const audioRef = useRef(null);
  const animationRef = useRef(null);
  const isPlayingRef = useRef(false);

  useEffect(() => {
    if (!currentSpeech) return;
    
    // Prevent multiple simultaneous playbacks
    if (isPlayingRef.current) {
      console.log('Audio is already playing, ignoring new request');
      return;
    }

    const { audioData, visemeData } = currentSpeech;
    
    // Debug: Log what we received
    console.log('🎤 AvatarModule received speech data:', {
      hasAudio: !!audioData,
      audioLength: audioData?.length || 0,
      hasVisemes: !!visemeData,
      visemeCount: visemeData?.length || 0,
      text: currentSpeech?.text?.substring(0, 50)
    });
    
    // Check if we have the required data
    if (!audioData) {
      console.error('❌ No audio data in currentSpeech:', currentSpeech);
      return;
    }

    // Stop any existing playback
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current.src = '';
      audioRef.current.load();
      audioRef.current = null;
    }

    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = null;
    }

    // Create and play audio
    if (audioData) {
      // gTTS generates MP3, not WAV
      const audio = new Audio(`data:audio/mp3;base64,${audioData}`);
      audioRef.current = audio;
      
      console.log('Playing audio with viseme data:', visemeData?.length, 'visemes');

      audio.onloadedmetadata = () => {
        setAudioDuration(audio.duration || 0);
      };

      audio.onplay = () => {
        isPlayingRef.current = true;
        updateSpeakingState(true);
      };

      audio.onended = () => {
        isPlayingRef.current = false;
        updateSpeakingState(false);
        setVisemeIndex(0);
        setProgress(0);
        setAudioTime(0);
        setAudioDuration(0);
      };

      audio.onerror = (error) => {
        console.error('Audio playback error:', error);
        isPlayingRef.current = false;
        updateSpeakingState(false);
      };

      // Animate visemes with audio sync
      if (visemeData && visemeData.length > 0) {
        console.log('🎤 Starting viseme animation with', visemeData.length, 'visemes');
        console.log('📊 First 5 visemes:', JSON.stringify(visemeData.slice(0, 5), null, 2));
        console.log('📊 Last 5 visemes:', JSON.stringify(visemeData.slice(-5), null, 2));
        
        // Calculate scaling factor to match actual audio duration
        let estimatedDuration = 0;
        if (visemeData.length > 0) {
          const lastViseme = visemeData[visemeData.length - 1];
          estimatedDuration = (lastViseme.start || 0) + (lastViseme.duration || 0);
        }
        
        let audioStartTime = null;
        let lastVisemeIndex = -1;
        let frameCount = 0;
        let durationScale = 1.0; // Will be updated when audio duration is known
        let scaledVisemes = visemeData; // Will be recalculated when duration is known

        const scaleVisemes = (actualDuration) => {
          if (estimatedDuration > 0 && actualDuration > 0) {
            durationScale = actualDuration / estimatedDuration;
            console.log(`📏 Scaling visemes: estimated=${estimatedDuration.toFixed(3)}s, actual=${actualDuration.toFixed(3)}s, scale=${durationScale.toFixed(3)}`);
            
            scaledVisemes = visemeData.map(viseme => ({
              ...viseme,
              start: (viseme.start || 0) * durationScale,
              duration: (viseme.duration || 0) * durationScale
            }));
          } else {
            scaledVisemes = visemeData;
          }
        };

        const animate = () => {
          // Use audio currentTime for precise sync
          if (!audioRef.current) {
            console.warn('⚠️ Audio ref is null, stopping animation');
            return;
          }
          
          const audioTime = audioRef.current.currentTime;
          const actualDuration = audioRef.current.duration;
          
          setAudioTime(audioTime);
          
          // Scale visemes once we know the actual audio duration
          if (actualDuration > 0 && durationScale === 1.0 && estimatedDuration > 0) {
            scaleVisemes(actualDuration);
          }
          
          if (audioStartTime === null) {
            audioStartTime = audioTime;
            console.log(`🎵 Audio started at ${audioTime.toFixed(3)}s, duration: ${actualDuration.toFixed(3)}s`);
          }
          
          const elapsed = audioTime;
          frameCount++;
          
          // Find current viseme based on audio time (using scaled visemes)
          let currentViseme = 0;
          let foundViseme = false;
          
          // Search through scaled visemes to find the one that contains current time
          for (let i = 0; i < scaledVisemes.length; i++) {
            const viseme = scaledVisemes[i];
            const visemeStart = viseme.start || 0;
            const visemeDuration = viseme.duration || 0;
            const visemeEnd = visemeStart + visemeDuration;
            
            // Check if current time is within this viseme's range
            if (elapsed >= visemeStart && elapsed < visemeEnd) {
              currentViseme = viseme.viseme || 0;
              foundViseme = true;
              break;
            }
          }
          
          // If no exact match, find the closest viseme (for edge cases)
          if (!foundViseme && scaledVisemes.length > 0) {
            // Find the viseme that's closest to current time
            let closestViseme = scaledVisemes[0];
            let minDistance = Math.abs(elapsed - (closestViseme.start || 0));
            
            for (let i = 1; i < scaledVisemes.length; i++) {
              const viseme = scaledVisemes[i];
              const visemeStart = viseme.start || 0;
              const distance = Math.abs(elapsed - visemeStart);
              
              if (distance < minDistance) {
                minDistance = distance;
                closestViseme = viseme;
              }
            }
            
            // Use closest viseme if we're within 0.2 seconds
            if (minDistance < 0.2) {
              currentViseme = closestViseme.viseme || 0;
              foundViseme = true;
            }
          }
          
          // Always update viseme (even if same) to ensure state is fresh
          if (currentViseme !== lastVisemeIndex) {
            lastVisemeIndex = currentViseme;
            setVisemeIndex(currentViseme);
            console.log(`🔄 Viseme ${currentViseme} at ${elapsed.toFixed(3)}s (found: ${foundViseme}, scale: ${durationScale.toFixed(3)})`);
          } else if (frameCount % 60 === 0) {
            // Log every 60 frames to show animation is running
            console.log(`⏱️  Animation running: viseme ${currentViseme}, time ${elapsed.toFixed(3)}s/${actualDuration.toFixed(3)}s`);
          }

          // Update progress based on audio duration
          setAudioDuration(actualDuration);
          setProgress((audioTime / actualDuration) * 100);

          if (!audioRef.current.paused && !audioRef.current.ended) {
            animationRef.current = requestAnimationFrame(animate);
          } else {
            console.log(`⏹️ Audio ended at ${elapsed.toFixed(3)}s, resetting visemes`);
            setVisemeIndex(0);
            setProgress(0);
            setAudioTime(0);
            isPlayingRef.current = false;
            updateSpeakingState(false);
          }
        };

        // Start animation immediately when audio metadata is loaded
        const startAnimation = () => {
          if (audioRef.current && audioRef.current.readyState >= 2) {
            const actualDur = audioRef.current.duration;
            if (actualDur > 0) {
              scaleVisemes(actualDur);
            }
            console.log('✅ Audio ready, starting animation');
            animationRef.current = requestAnimationFrame(animate);
          } else {
            console.log('⏳ Waiting for audio to be ready...');
            setTimeout(startAnimation, 50);
          }
        };

        // Start animation after a small delay to ensure audio is ready
        setTimeout(startAnimation, 100);
      } else {
        console.warn('⚠️ No viseme data provided! visemeData:', visemeData);
      }

      // Play audio with a small delay to ensure everything is ready
      setTimeout(() => {
        if (audioRef.current === audio) {
          audio.play().catch(error => {
            console.error('Error playing audio:', error);
            isPlayingRef.current = false;
            updateSpeakingState(false);
          });
        }
      }, 100);
    }

    // Cleanup
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
        audioRef.current.src = '';
        audioRef.current.load();
        audioRef.current = null;
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
      setAudioTime(0);
      setAudioDuration(0);
      setVisemeIndex(0);
      isPlayingRef.current = false;
      updateSpeakingState(false);
    };
  }, [currentSpeech, updateSpeakingState]);

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      sx={{
        width: '100%',
        height: '100%',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Avatar Type Toggle */}
      <Box
        component={motion.div}
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        sx={{
          position: 'absolute',
          top: 20,
          right: 20,
          zIndex: 10,
        }}
      >
        <ToggleButtonGroup
          value={avatarType}
          exclusive
          onChange={(e, newValue) => newValue && setAvatarType(newValue)}
          size="small"
          sx={{ 
            backgroundColor: 'rgba(15, 23, 42, 0.9)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(99, 102, 241, 0.3)',
            borderRadius: 2,
            boxShadow: '0 4px 16px rgba(0, 0, 0, 0.3)',
            '& .MuiToggleButton-root': {
              color: 'text.secondary',
              border: 'none',
              px: 2,
              py: 1,
              transition: 'all 0.2s ease',
              '&.Mui-selected': {
                backgroundColor: 'primary.main',
                color: 'white',
                '&:hover': {
                  backgroundColor: 'primary.dark',
                },
              },
              '&:hover': {
                backgroundColor: 'rgba(99, 102, 241, 0.2)',
                transform: 'scale(1.05)',
              },
            },
          }}
        >
          <ToggleButton value="lateman">Lateman</ToggleButton>
          <ToggleButton value="oldman">Old Man</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Avatar Display */}
      <Box sx={{ flex: 1, position: 'relative' }}>
        <AnimatePresence mode="wait">
          {avatarType === 'lateman' && (
            <Box
              key="lateman"
              component={motion.div}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              sx={{ width: '100%', height: '100%' }}
            >
              <LatemanAvatar 
                audioTime={audioTime} 
                audioDuration={audioDuration} 
                visemeIndex={visemeIndex} 
                visemeSequence={currentSpeech?.visemeData || currentSpeech?.visemes || []}
                isSpeaking={isSpeaking} 
              />
            </Box>
          )}
          {avatarType === 'oldman' && (
            <Box
              key="oldman"
              component={motion.div}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              sx={{ width: '100%', height: '100%' }}
            >
              <OldManAvatar visemeIndex={visemeIndex} isSpeaking={isSpeaking} />
            </Box>
          )}
        </AnimatePresence>
      </Box>

      {/* Status Overlay */}
      <Box
        sx={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          right: 20,
        }}
      >
        <AnimatePresence mode="wait">
          {isSpeaking && (
            <Paper
              key="speaking"
              component={motion.div}
              initial={{ opacity: 0, y: 20, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.9 }}
              transition={{ duration: 0.3 }}
              sx={{
                p: 2.5,
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                borderRadius: 3,
                boxShadow: '0 8px 32px rgba(0, 0, 0, 0.4)',
              }}
            >
              <Typography 
                variant="body2" 
                gutterBottom
                component={motion.span}
                animate={{ opacity: [1, 0.7, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
                sx={{
                  fontWeight: 500,
                  color: 'primary.light',
                  mb: 1.5,
                }}
              >
                🎤 Speaking... {currentSpeech?.text?.substring(0, 50)}
                {currentSpeech?.text?.length > 50 ? '...' : ''}
              </Typography>
              <LinearProgress 
                variant="determinate" 
                value={progress}
                sx={{
                  height: 6,
                  borderRadius: 3,
                  backgroundColor: 'rgba(99, 102, 241, 0.2)',
                  '& .MuiLinearProgress-bar': {
                    borderRadius: 3,
                    background: 'linear-gradient(90deg, #6366f1 0%, #ec4899 100%)',
                  },
                }}
              />
            </Paper>
          )}

          {!isSpeaking && (
            <Paper
              key="ready"
              component={motion.div}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.3 }}
              sx={{
                p: 1.5,
                backgroundColor: 'rgba(15, 23, 42, 0.7)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(99, 102, 241, 0.2)',
                borderRadius: 2,
              }}
            >
              <Typography 
                variant="caption" 
                sx={{
                  color: 'text.secondary',
                  fontWeight: 500,
                }}
              >
                ✨ Ready to speak
              </Typography>
            </Paper>
          )}
        </AnimatePresence>
      </Box>
    </Box>
  );
};

export default AvatarModule;


