import { Box, Divider, IconButton, Link, Stack, Typography, Menu, MenuItem, Dialog, Slide, LinearProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles'
import { DotsThreeVertical, DownloadSimple, Image, X, CaretLeft, CaretRight, Play, Pause, User } from 'phosphor-react';
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {Message_options} from '../../data'

// Helper function to format time (HH:mm)
const formatMessageTime = (timestamp) => {
  if (!timestamp) return '';
  try {
    const date = new Date(timestamp);
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${hours}:${minutes}`;
  } catch (error) {
    return '';
  }
};

// Helper function to format date in Portuguese (e.g., "23 de Janeiro de 2026, segunda-feira")
const formatDateInPortuguese = (timestamp) => {
  if (!timestamp) return '';
  try {
    const date = new Date(timestamp);
    const day = date.getDate();
    const monthNames = [
      'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
      'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
    ];
    const weekDayNames = [
      'domingo', 'segunda-feira', 'terça-feira', 'quarta-feira', 'quinta-feira', 'sexta-feira', 'sábado'
    ];
    const month = monthNames[date.getMonth()];
    const year = date.getFullYear();
    const weekDay = weekDayNames[date.getDay()];
    return `${day} de ${month} de ${year}, ${weekDay}`;
  } catch (error) {
    return '';
  }
};

// Helper function to check if two timestamps are on different days
const isDifferentDay = (timestamp1, timestamp2) => {
  if (!timestamp1 || !timestamp2) return false;
  try {
    const date1 = new Date(timestamp1);
    const date2 = new Date(timestamp2);
    return (
      date1.getDate() !== date2.getDate() ||
      date1.getMonth() !== date2.getMonth() ||
      date1.getFullYear() !== date2.getFullYear()
    );
  } catch (error) {
    return false;
  }
};

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

const DocMsg = ({el,menu}) => {
    const theme = useTheme();
  return (
    <Stack direction='row' justifyContent={el.incoming ? 'start' : 'end'}>
        <Box p={1.5} sx={{
                backgroundColor: el.incoming ? theme.palette.background.default :
                    theme.palette.primary.main, borderRadius: 1, width: 'max-content'
            }}>
        <Stack spacing={2}>
            <Stack p={2} spacing={3} direction='row' alignItems='center' 
            sx={{backgroundColor:theme.palette.background.paper, borderRadius:1}}>
                <Image size={48}/>
                <Typography variant='caption'>
                    Abstract.png
                </Typography>
                <IconButton>
                    <DownloadSimple/>
                </IconButton>
            </Stack>
            <Stack spacing={0.5}>
                <Typography variant='body2' sx={{color: el.incoming ? theme.palette.text : '#fff' }} >
                    {el.message}
                </Typography>
                {el.timestamp && (
                    <Typography 
                        variant='caption' 
                        sx={{ 
                            color: el.incoming ? theme.palette.text.secondary : 'rgba(255, 255, 255, 0.7)',
                            fontSize: '0.65rem',
                            lineHeight: 1,
                            alignSelf: 'flex-end'
                        }}
                    >
                        {formatMessageTime(el.timestamp)}
                    </Typography>
                )}
            </Stack>
        </Stack>
        </Box>
        {menu && <MessageOptions/>}
        
    </Stack>
  )
}

const AudioMsg = ({el, menu}) => {
  const theme = useTheme();
  const audioRef = useRef(null);
  const progressBarRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [preloadedData, setPreloadedData] = useState(null);
  
  const audioUrl = el.audio || (el.audioFiles && el.audioFiles.length > 0 ? el.audioFiles[0].url : null);
  const transcription = el.transcription || el.message || '';
  const maxLength = 150;
  const shouldTruncate = transcription.length > maxLength;
  const displayText = isExpanded || !shouldTruncate ? transcription : `${transcription.substring(0, maxLength)}...`;

  // Preload audio data for visualization
  useEffect(() => {
    if (!audioUrl || preloadedData) return;

    const loadAudioData = async () => {
      try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const response = await fetch(audioUrl);
        const arrayBuffer = await response.arrayBuffer();
        const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
        
        // Sample audio data across the duration
        const channelData = audioBuffer.getChannelData(0);
        const samples = 50;
        const sampleRate = audioBuffer.sampleRate;
        const duration = audioBuffer.duration;
        const step = Math.floor(channelData.length / samples);
        
        const sampledData = [];
        for (let i = 0; i < samples; i++) {
          const start = i * step;
          const end = Math.min(start + step, channelData.length);
          let sum = 0;
          let max = 0;
          
          for (let j = start; j < end; j++) {
            const abs = Math.abs(channelData[j]);
            sum += abs;
            max = Math.max(max, abs);
          }
          
          // Use RMS (root mean square) for better visualization
          const rms = Math.sqrt(sum / (end - start));
          sampledData.push(rms);
        }
        
        // Normalize data
        const maxValue = Math.max(...sampledData);
        const normalizedData = sampledData.map(val => maxValue > 0 ? val / maxValue : 0);
        
        setPreloadedData(normalizedData);
        audioContext.close();
      } catch (error) {
        console.error('Error loading audio data:', error);
      }
    };

    loadAudioData();
  }, [audioUrl, preloadedData]);

  // Removed real-time audio analysis to avoid interfering with playback
  // Using only preloaded data for visualization

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const updateTime = () => {
      if (!isDragging && audio) {
        setCurrentTime(audio.currentTime || 0);
      }
    };
    const updateDuration = () => {
      if (audio && audio.duration && !isNaN(audio.duration)) {
        setDuration(audio.duration);
      }
    };
    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };
    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);
    const handleLoadedData = () => {
      updateDuration();
    };
    const handleCanPlay = () => {
      updateDuration();
    };

    // Update duration immediately if already available
    if (audio.duration && !isNaN(audio.duration)) {
      setDuration(audio.duration);
    }

    audio.addEventListener('timeupdate', updateTime);
    audio.addEventListener('loadedmetadata', updateDuration);
    audio.addEventListener('loadeddata', handleLoadedData);
    audio.addEventListener('canplay', handleCanPlay);
    audio.addEventListener('durationchange', updateDuration);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('play', handlePlay);
    audio.addEventListener('pause', handlePause);

    // Periodic update as fallback
    const interval = setInterval(() => {
      if (audio && !audio.paused && !isDragging) {
        updateTime();
      }
      if (audio && audio.duration && !isNaN(audio.duration) && duration === 0) {
        updateDuration();
      }
    }, 100);

    return () => {
      clearInterval(interval);
      audio.removeEventListener('timeupdate', updateTime);
      audio.removeEventListener('loadedmetadata', updateDuration);
      audio.removeEventListener('loadeddata', handleLoadedData);
      audio.removeEventListener('canplay', handleCanPlay);
      audio.removeEventListener('durationchange', updateDuration);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('play', handlePlay);
      audio.removeEventListener('pause', handlePause);
    };
  }, [audioUrl, isDragging, duration]);

  const togglePlayPause = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying || !audio.paused) {
      audio.pause();
    } else {
      try {
        await audio.play();
      } catch (error) {
        console.error('Error playing audio:', error);
      }
    }
  };

  const handleProgressUpdate = useCallback((e) => {
    const audio = audioRef.current;
    if (!audio || !duration || !progressBarRef.current) return;

    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const percentage = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = percentage * duration;

    if (!isNaN(newTime) && isFinite(newTime)) {
      audio.currentTime = newTime;
      setCurrentTime(newTime);
    }
  }, [duration]);

  const handleProgressMouseDown = (e) => {
    setIsDragging(true);
    handleProgressUpdate(e);
  };

  useEffect(() => {
    if (!isDragging) return;

    const handleProgressMouseMove = (e) => {
      handleProgressUpdate(e);
    };

    const handleProgressMouseUp = (e) => {
      handleProgressUpdate(e);
      setIsDragging(false);
    };

    document.addEventListener('mousemove', handleProgressMouseMove);
    document.addEventListener('mouseup', handleProgressMouseUp);
    
    return () => {
      document.removeEventListener('mousemove', handleProgressMouseMove);
      document.removeEventListener('mouseup', handleProgressMouseUp);
    };
  }, [isDragging, handleProgressUpdate]);

  const formatTime = (seconds) => {
    if (isNaN(seconds)) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!audioUrl) {
    // Fallback to text message if no audio URL
    return <TextMsg el={el} menu={menu} />;
  }

  return (
    <Stack direction='row' justifyContent={el.incoming ? 'start' : 'end'}>
      <Box p={1.5} sx={{
        backgroundColor: el.incoming ? theme.palette.background.default :
          theme.palette.primary.main, 
        borderRadius: 1, 
        width: 'max-content',
        maxWidth: '50%'
      }}>
        <Stack spacing={1.5}>
          {/* Audio Player - WhatsApp Style */}
          <Stack direction='row' spacing={1.5} alignItems='center' sx={{ minWidth: 200 }}>
            <IconButton
              onClick={togglePlayPause}
              sx={{
                backgroundColor: el.incoming ? theme.palette.primary.main : '#fff',
                color: el.incoming ? '#fff' : theme.palette.primary.main,
                width: 42,
                height: 42,
                '&:hover': {
                  backgroundColor: el.incoming ? theme.palette.primary.dark : 'rgba(255, 255, 255, 0.9)',
                }
              }}
            >
              {isPlaying ? <Pause size={20} weight="fill" /> : <Play size={20} weight="fill" />}
            </IconButton>
            <audio 
              ref={audioRef} 
              src={audioUrl} 
              preload="metadata"
            />
            
            <Box sx={{ flex: 1, minWidth: 150, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              <Box
                ref={progressBarRef}
                sx={{
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 0.5,
                  cursor: 'pointer',
                  position: 'relative',
                  mb: 1,
                  userSelect: 'none',
                  px: 0.5
                }}
                onMouseDown={handleProgressMouseDown}
              >
                {Array.from({ length: 50 }).map((_, index) => {
                  const barProgress = (index / 50) * 100;
                  const isActive = barProgress <= progress;
                  
                  // Use preloaded audio data
                  let amplitude = 0;
                  if (preloadedData) {
                    amplitude = preloadedData[index] || 0;
                  } else {
                    // Fallback to sine wave while loading
                    amplitude = (Math.sin(index * 0.5) * 0.5 + 0.5);
                  }
                  
                  // Calculate bar height based on amplitude
                  const minHeight = 4;
                  const maxHeight = isActive ? 32 : 36; // Inactive bars slightly taller
                  const barHeight = minHeight + amplitude * (maxHeight - minHeight);
                  
                  return (
                    <Box
                      key={index}
                      sx={{
                        width: 2.5,
                        height: `${barHeight}px`,
                        backgroundColor: isActive
                          ? (el.incoming ? theme.palette.primary.main : '#fff')
                          : (el.incoming ? 'rgba(0, 0, 0, 0.12)' : 'rgba(255, 255, 255, 0.35)'),
                        borderRadius: 1.5,
                        transition: isDragging ? 'none' : 'height 0.05s linear, background-color 0.1s linear',
                        minHeight: '4px'
                      }}
                    />
                  );
                })}
              </Box>
              <Stack direction='row' justifyContent='space-between' alignItems='center' spacing={1} sx={{ width: '100%' }}>
                <Typography 
                  variant='caption' 
                  sx={{ 
                    color: el.incoming ? theme.palette.text.secondary : 'rgba(255, 255, 255, 0.9)',
                    fontSize: '0.75rem',
                    fontWeight: 500,
                    minWidth: 45,
                    fontFamily: 'monospace'
                  }}
                >
                  {formatTime(currentTime)}
                </Typography>
                <Typography 
                  variant='caption' 
                  sx={{ 
                    color: el.incoming ? theme.palette.text.secondary : 'rgba(255, 255, 255, 0.7)',
                    fontSize: '0.75rem',
                    minWidth: 45,
                    textAlign: 'right',
                    fontFamily: 'monospace'
                  }}
                >
                  {formatTime(duration)}
                </Typography>
              </Stack>
            </Box>
          </Stack>

          {/* Transcription */}
          {transcription && (
            <Stack spacing={0.5} sx={{ alignSelf: 'flex-end', alignItems: 'flex-end' }}>
              <Typography 
                variant='body2' 
                sx={{ 
                  color: el.incoming 
                    ? theme.palette.text.secondary 
                    : 'rgba(255, 255, 255, 0.6)',
                  fontSize: '0.8rem',
                  lineHeight: 1.4,
                  textAlign: 'right'
                }}
              >
                "{displayText}"
              </Typography>
              {shouldTruncate && (
                <Typography
                  variant='caption'
                  onClick={() => setIsExpanded(!isExpanded)}
                  sx={{
                    color: el.incoming 
                      ? theme.palette.text.secondary 
                      : 'rgba(255, 255, 255, 0.6)',
                    cursor: 'pointer',
                    textDecoration: 'underline',
                    fontSize: '0.75rem',
                    textAlign: 'right',
                    '&:hover': {
                      opacity: 0.8
                    }
                  }}
                >
                  {isExpanded ? 'Mostrar menos' : 'Mostrar mais'}
                </Typography>
              )}
            </Stack>
          )}

          {/* Timestamp */}
          {el.timestamp && (
            <Typography 
              variant='caption' 
              sx={{ 
                color: el.incoming ? theme.palette.text.secondary : 'rgba(255, 255, 255, 0.7)',
                fontSize: '0.65rem',
                lineHeight: 1,
                alignSelf: 'flex-end'
              }}
            >
              {formatMessageTime(el.timestamp)}
            </Typography>
          )}
        </Stack>
      </Box>
      {menu && <MessageOptions/>}
    </Stack>
  );
};

const LinkMsg = ({el,menu}) => {
    const theme = useTheme();
  return (
    <Stack direction='row' justifyContent={el.incoming ? 'start' : 'end'}>
        <Box p={1.5} sx={{
                backgroundColor: el.incoming ? theme.palette.background.default :
                    theme.palette.primary.main, borderRadius: 1, width: 'max-content'
            }}>
        <Stack spacing={2}>
            <Stack p={2} spacing={3} alignItems='start'
             sx={{backgroundColor:theme.palette.background.paper, borderRadius: 1}}>
                <img src={el.preview} alt={el.message} style={{maxHeight:210, borderRadius:'10px'}}/>
                <Stack spacing={2}>
                    <Typography variant='subtitle2'>Creating Chat App</Typography>
                    <Typography variant='subtitle2' sx={{color:theme.palette.primary.main}} 
                    component={Link} to="//https://www.youtube.com">www.youtube.com</Typography>
                </Stack>
                <Stack spacing={0.5}>
                    <Typography variant='body2' color={el.incoming ? theme.palette.text : '#fff'}>
                        {el.message}
                    </Typography>
                    {el.timestamp && (
                        <Typography 
                            variant='caption' 
                            sx={{ 
                                color: el.incoming ? theme.palette.text.secondary : 'rgba(255, 255, 255, 0.7)',
                                fontSize: '0.65rem',
                                lineHeight: 1,
                                alignSelf: 'flex-end'
                            }}
                        >
                            {formatMessageTime(el.timestamp)}
                        </Typography>
                    )}
                </Stack>
            </Stack>
        </Stack>
        </Box>
        {menu && <MessageOptions/>}
    </Stack>
  )
}

const ReplyMsg = ({el, menu}) => {
    const theme = useTheme();
  return (
    <Stack direction='row' justifyContent={el.incoming ? 'start' : 'end'}>
        <Box p={1.5} sx={{
                backgroundColor: el.incoming ? theme.palette.background.default :
                    theme.palette.primary.main, borderRadius: 1, width: 'max-content'
            }}>
        <Stack spacing={2}>
            <Stack p={2} direction='column' spacing={3} alignItems='center'
            sx={{backgroundColor:theme.palette.background.paper, borderRadius:1}}>
                <Typography variant='body2' color={theme.palette.text}>
                    {el.message}
                </Typography>    
            </Stack>
            <Stack spacing={0.5}>
                <Typography variant='body2' color={ el.incoming ? theme.palette.text : '#fff'}>
                    {el.reply}
                </Typography>
                {el.timestamp && (
                    <Typography 
                        variant='caption' 
                        sx={{ 
                            color: el.incoming ? theme.palette.text.secondary : 'rgba(255, 255, 255, 0.7)',
                            fontSize: '0.65rem',
                            lineHeight: 1,
                            alignSelf: 'flex-end'
                        }}
                    >
                        {formatMessageTime(el.timestamp)}
                    </Typography>
                )}
            </Stack>
        </Stack>
        </Box>
        {menu && <MessageOptions/>}
    </Stack>
  )
}

const ImageModal = ({ open, onClose, images, currentIndex, onNext, onPrevious }) => {
  const theme = useTheme();
  
  React.useEffect(() => {
    const handleKeyDown = (event) => {
      if (!open) return;
      
      if (event.key === 'Escape') {
        onClose();
      } else if (event.key === 'ArrowLeft' && currentIndex > 0) {
        onPrevious();
      } else if (event.key === 'ArrowRight' && currentIndex < images.length - 1) {
        onNext();
      }
    };
    
    if (open) {
      window.addEventListener('keydown', handleKeyDown);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'unset';
    };
  }, [open, currentIndex, images.length, onClose, onNext, onPrevious]);
  
  if (!images || images.length === 0) return null;
  
  const currentImage = images[currentIndex];
  const imageUrl = getImageUrl(currentImage);
  
  return (
    <Dialog
      open={open}
      onClose={onClose}
      TransitionComponent={Transition}
      maxWidth={false}
      fullWidth
      PaperProps={{
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
          boxShadow: 'none',
          maxWidth: '100vw',
          maxHeight: '100vh',
          margin: 0,
          borderRadius: 0,
        }
      }}
      sx={{
        '& .MuiBackdrop-root': {
          backgroundColor: 'rgba(0, 0, 0, 0.9)',
        }
      }}
    >
      <Box
        sx={{
          position: 'relative',
          width: '100vw',
          height: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onClick={onClose}
      >
        {/* Close button */}
        <IconButton
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          sx={{
            position: 'absolute',
            top: 16,
            right: 16,
            color: 'white',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.7)',
            },
            zIndex: 1,
          }}
        >
          <X size={24} />
        </IconButton>
        
        {/* Previous button */}
        {images.length > 1 && currentIndex > 0 && (
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onPrevious();
            }}
            sx={{
              position: 'absolute',
              left: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'white',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              },
              zIndex: 1,
            }}
          >
            <CaretLeft size={32} />
          </IconButton>
        )}
        
        {/* Next button */}
        {images.length > 1 && currentIndex < images.length - 1 && (
          <IconButton
            onClick={(e) => {
              e.stopPropagation();
              onNext();
            }}
            sx={{
              position: 'absolute',
              right: 16,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'white',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              '&:hover': {
                backgroundColor: 'rgba(0, 0, 0, 0.7)',
              },
              zIndex: 1,
            }}
          >
            <CaretRight size={32} />
          </IconButton>
        )}
        
        {/* Image counter */}
        {images.length > 1 && (
          <Box
            sx={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              color: 'white',
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              padding: '8px 16px',
              borderRadius: '20px',
              zIndex: 1,
            }}
          >
            <Typography variant="body2">
              {currentIndex + 1} / {images.length}
            </Typography>
          </Box>
        )}
        
        {/* Image */}
        <img
          src={imageUrl}
          alt={`Image ${currentIndex + 1}`}
          style={{
            maxWidth: '100%',
            maxHeight: '100%',
            objectFit: 'contain',
            cursor: 'pointer',
          }}
          onClick={(e) => {
            e.stopPropagation();
            onClose();
          }}
          onError={(e) => {
            console.error('Failed to load image:', imageUrl);
            e.target.style.display = 'none';
          }}
        />
      </Box>
    </Dialog>
  );
};

// Helper function to get image URL (moved outside component for reuse)
const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  
  // Handle object input - prioritize url field for external URLs
  let imagePathStr = imagePath;
  if (typeof imagePath === 'object' && imagePath !== null) {
    // Prioritize url field if it exists (for external URLs)
    if (imagePath.url) {
      imagePathStr = imagePath.url;
    } else if (imagePath.path && (imagePath.path.startsWith('http://') || imagePath.path.startsWith('https://'))) {
      // If path is a URL, use it
      imagePathStr = imagePath.path;
    } else {
      // Otherwise, use filename, path, or name
      imagePathStr = imagePath.filename || imagePath.path || imagePath.name || '';
    }
    
    if (!imagePathStr) {
      console.warn('Image object does not contain filename, path, name, or url:', imagePath);
      return '';
    }
  }
  
  // Ensure it's a string
  if (typeof imagePathStr !== 'string') {
    console.warn('Image path is not a string:', imagePathStr);
    return '';
  }
  
  // If it's already a full URL, return as is
  if (imagePathStr.startsWith('http://') || imagePathStr.startsWith('https://') || imagePathStr.startsWith('data:')) {
    return imagePathStr;
  }
  
  // Construct URL from backend
  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3006';
  const filename = imagePathStr.includes('/') 
    ? imagePathStr.split('/').pop() 
    : imagePathStr;
  return `${API_BASE_URL}/uploads/${filename}`;
};

const MediaMsg = ({el,menu}) => {
    const theme = useTheme();
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);
    
    // Handle image display - support both single image and multiple images
    let images = [];
    if (el.imageFiles && el.imageFiles.length > 0) {
      images = el.imageFiles;
    } else if (el.img) {
      // Fallback to el.img for backward compatibility
      images = [{ filename: el.img, path: el.img }];
    }
    
    const handleImageClick = (index) => {
      setSelectedImageIndex(index);
      setModalOpen(true);
    };
    
    const handleCloseModal = () => {
      setModalOpen(false);
    };
    
    const handleNext = () => {
      if (selectedImageIndex < images.length - 1) {
        setSelectedImageIndex(selectedImageIndex + 1);
      }
    };
    
    const handlePrevious = () => {
      if (selectedImageIndex > 0) {
        setSelectedImageIndex(selectedImageIndex - 1);
      }
    };
  
  return (
    <>
      <Stack direction='row' justifyContent={el.incoming ? 'start' : 'end'}>
          <Box p={1.5} sx={{
                  backgroundColor: el.incoming ? theme.palette.background.default :
                      theme.palette.primary.main, 
                  borderRadius: 1, 
                  width: 'max-content', 
                  maxWidth: '75%'
              }}>
                  <Stack spacing={1}>
                      {images.length > 0 && (
                        <Stack spacing={1}>
                          {images.map((img, index) => {
                            const imageUrl = getImageUrl(img);
                            return (
                              <img 
                                key={index}
                                src={imageUrl} 
                                alt={el.message || `Image ${index + 1}`} 
                                style={{
                                  maxHeight: 300, 
                                  maxWidth: '100%',
                                  borderRadius: '10px',
                                  objectFit: images.length === 1 ? 'cover' : 'contain',
                                  display: 'block',
                                  cursor: 'pointer',
                                }}
                                onClick={() => handleImageClick(index)}
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                            );
                          })}
                        </Stack>
                      )}
                      {el.message && (
                        <Stack spacing={0.5}>
                            <Typography variant='body2' color={el.incoming ? theme.palette.text : '#fff'}>
                                {el.message}
                            </Typography>
                            {el.timestamp && (
                                <Typography 
                                    variant='caption' 
                                    sx={{ 
                                        color: el.incoming ? theme.palette.text.secondary : 'rgba(255, 255, 255, 0.7)',
                                        fontSize: '0.65rem',
                                        lineHeight: 1,
                                        alignSelf: 'flex-end'
                                    }}
                                >
                                    {formatMessageTime(el.timestamp)}
                                </Typography>
                            )}
                        </Stack>
                      )}
                      {!el.message && el.timestamp && (
                        <Typography 
                            variant='caption' 
                            sx={{ 
                                color: el.incoming ? theme.palette.text.secondary : 'rgba(255, 255, 255, 0.7)',
                                fontSize: '0.65rem',
                                lineHeight: 1,
                                alignSelf: 'flex-end'
                            }}
                        >
                            {formatMessageTime(el.timestamp)}
                        </Typography>
                      )}
                    </Stack>
              </Box>
              {menu && <MessageOptions/>}
      </Stack>
      
      {/* Image Modal */}
      <ImageModal
        open={modalOpen}
        onClose={handleCloseModal}
        images={images}
        currentIndex={selectedImageIndex}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
    </>
  )
}

const TextMsg = ({el,menu}) => {
    const theme = useTheme();
    return (
        <Stack direction='row' justifyContent={el.incoming ? 'start' : 'end'}>
            <Box p={1.5} sx={{
                backgroundColor: el.incoming ? theme.palette.background.default :
                    theme.palette.primary.main, borderRadius: 1, width: 'max-content', maxWidth: '75%',
                position: 'relative'
            }}>
                <Stack spacing={0.5}>
                    <Typography variant='body2' color={el.incoming ? theme.palette.text : '#fff'}>
                        {el.message}
                    </Typography>
                    {el.timestamp && (
                        <Typography 
                            variant='caption' 
                            sx={{ 
                                color: el.incoming ? theme.palette.text.secondary : 'rgba(255, 255, 255, 0.7)',
                                fontSize: '0.65rem',
                                lineHeight: 1,
                                alignSelf: 'flex-end'
                            }}
                        >
                            {formatMessageTime(el.timestamp)}
                        </Typography>
                    )}
                </Stack>
            </Box>
            {menu && <MessageOptions/>}
        </Stack>
    )
}

const TimeLine = ({ el }) => {
    const theme = useTheme();
    return <Stack direction='row' alignItems='center' justifyContent='space-between'>
        <Divider width='46%' />
        <Typography variant='caption' sx={{ color: theme.palette.text }}>
            {el.text}
        </Typography>
        <Divider width='46%' />
    </Stack>
}

const DateDivider = ({ timestamp }) => {
    const theme = useTheme();
    const formattedDate = formatDateInPortuguese(timestamp);
    
    if (!formattedDate) return null;
    
    return (
        <Stack direction='row' alignItems='center' justifyContent='center' sx={{ py: 2 }}>
            <Typography 
                variant='caption' 
                sx={{ 
                    color: theme.palette.text.secondary,
                    fontSize: '0.75rem',
                    fontWeight: 500
                }}
            >
                {formattedDate}
            </Typography>
        </Stack>
    );
}

const AgentDivider = ({ agentName = 'Andrioli Soares' }) => {
    const theme = useTheme();
    
    return (
        <Stack direction='row' alignItems='center' justifyContent='center' sx={{ py: 2 }}>
            <Typography 
                variant='caption' 
                sx={{ 
                    color: theme.palette.text.secondary,
                    fontSize: '0.75rem',
                    fontWeight: 500
                }}
            >
                <Box component="span" sx={{ fontWeight: 700 }}>{agentName}</Box> entrou na conversa e está atendendo agora
            </Typography>
        </Stack>
    );
}

const BotDivider = () => {
    const theme = useTheme();
    
    return (
        <Stack direction='row' alignItems='center' justifyContent='center' sx={{ py: 2 }}>
            <Typography 
                variant='caption' 
                sx={{ 
                    color: theme.palette.text.secondary,
                    fontSize: '0.75rem',
                    fontWeight: 500
                }}
            >
                Atendimento via Omilia
            </Typography>
        </Stack>
    );
}

const EscalationDivider = () => {
    const theme = useTheme();
    
    return (
        <Stack direction='row' alignItems='center' justifyContent='center' sx={{ py: 2 }}>
            <Box
                sx={{
                    px: 2,
                    py: 1,
                    borderRadius: '8px',
                    backgroundColor: theme.palette.mode === 'light' 
                        ? theme.palette.info.lighter 
                        : theme.palette.info.dark,
                    border: `1px solid ${theme.palette.info.main}`
                }}
            >
                <Typography 
                    variant='caption' 
                    sx={{ 
                        color: theme.palette.info.main,
                        fontSize: '0.75rem',
                        fontWeight: 600,
                        display: 'flex',
                        alignItems: 'center',
                        gap: 0.75
                    }}
                >
                    <User size={16} weight="fill" />
                    Mensagem escalada para atendimento humano
                </Typography>
            </Box>
        </Stack>
    );
}

const MessageOptions = () => {
    
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };
  return (
    <>
    <DotsThreeVertical 
    id="basic-button"
    aria-controls={open ? 'basic-menu' : undefined}
    aria-haspopup="true"
    aria-expanded={open ? 'true' : undefined}
    onClick={handleClick}
    size={20}
    />

    <Menu
        id="basic-menu"
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        MenuListProps={{
          'aria-labelledby': 'basic-button',
        }}
      >
      <Stack spacing={1} px={1}>
        {Message_options.map((el)=>(
            <MenuItem onClick={handleClick}>{el.title}</MenuItem>
        ))}
      </Stack>
      </Menu>
    </>
  )
}


// Component for grouped image messages (max 4 images in grid)
const GroupedImageMsg = ({messages, menu}) => {
  const theme = useTheme();
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  
  // Collect all images from grouped messages (max 4)
  const allImages = [];
  messages.forEach(msg => {
    if (msg.imageFiles && msg.imageFiles.length > 0) {
      msg.imageFiles.forEach(img => {
        if (allImages.length < 4) {
          allImages.push(img);
        }
      });
    } else if (msg.img && allImages.length < 4) {
      allImages.push({ filename: msg.img, path: msg.img });
    }
  });
  
  // Use first message properties for styling
  const firstMessage = messages[0];
  const isIncoming = firstMessage.incoming;
  
  const handleImageClick = (index) => {
    setSelectedImageIndex(index);
    setModalOpen(true);
  };
  
  const handleCloseModal = () => {
    setModalOpen(false);
  };
  
  const handleNext = () => {
    if (selectedImageIndex < allImages.length - 1) {
      setSelectedImageIndex(selectedImageIndex + 1);
    }
  };
  
  const handlePrevious = () => {
    if (selectedImageIndex > 0) {
      setSelectedImageIndex(selectedImageIndex - 1);
    }
  };
  
  // Calculate grid layout based on number of images
  // All images will have the same size
  // Gap matches the padding of the message box (p={1.5} = 12px)
  const gapSize = theme.spacing(1.5); // 12px to match Box padding
  
  const getGridLayout = (count) => {
    if (count === 1) return { gridTemplateColumns: '1fr', gap: gapSize };
    if (count === 2) return { gridTemplateColumns: '1fr 1fr', gap: gapSize };
    if (count === 3) {
      // 3 images: 2x2 grid, all same size
      return { 
        gridTemplateColumns: '1fr 1fr', 
        gap: gapSize,
        gridTemplateRows: '1fr 1fr'
      };
    }
    if (count === 4) return { gridTemplateColumns: '1fr 1fr', gap: gapSize, gridTemplateRows: '1fr 1fr' };
    return { gridTemplateColumns: '1fr 1fr', gap: gapSize };
  };
  
  const gridStyle = getGridLayout(allImages.length);
  const totalImagesCount = messages.reduce((count, msg) => {
    if (msg.imageFiles && msg.imageFiles.length > 0) {
      return count + msg.imageFiles.length;
    } else if (msg.img) {
      return count + 1;
    }
    return count;
  }, 0);
  
  return (
    <>
      <Stack direction='row' justifyContent={isIncoming ? 'start' : 'end'}>
        <Box p={1.5} sx={{
          backgroundColor: isIncoming ? theme.palette.background.default :
            theme.palette.primary.main, 
          borderRadius: 1, 
          width: 'max-content', 
          maxWidth: '75%'
        }}>
          <Stack spacing={1}>
            {allImages.length > 0 && (
              <Box
                sx={{
                  display: 'grid',
                  ...gridStyle,
                  width: '100%',
                  maxWidth: '300px'
                }}
              >
                {allImages.map((img, index) => {
                  const imageUrl = getImageUrl(img);
                  
                  return (
                    <Box
                      key={index}
                      sx={{
                        position: 'relative',
                        width: '100%',
                        aspectRatio: '1',
                        overflow: 'hidden',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        '&:hover': {
                          opacity: 0.9
                        }
                      }}
                      onClick={() => handleImageClick(index)}
                    >
                      <img
                        src={imageUrl}
                        alt={`Image ${index + 1}`}
                        style={{
                          width: '100%',
                          height: '100%',
                          objectFit: 'cover',
                          display: 'block'
                        }}
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      {totalImagesCount > 4 && index === 3 && (
                        <Box
                          sx={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            backgroundColor: 'rgba(0, 0, 0, 0.5)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: 'bold'
                          }}
                        >
                          +{totalImagesCount - 4}
                        </Box>
                      )}
                    </Box>
                  );
                })}
              </Box>
            )}
            {firstMessage.timestamp && (
              <Typography
                variant='caption'
                sx={{
                  color: isIncoming ? theme.palette.text.secondary : 'rgba(255, 255, 255, 0.7)',
                  fontSize: '0.65rem',
                  lineHeight: 1,
                  alignSelf: 'flex-end'
                }}
              >
                {formatMessageTime(firstMessage.timestamp)}
              </Typography>
            )}
          </Stack>
        </Box>
        {menu && <MessageOptions />}
      </Stack>
      
      {/* Image Modal */}
      <ImageModal
        open={modalOpen}
        onClose={handleCloseModal}
        images={allImages}
        currentIndex={selectedImageIndex}
        onNext={handleNext}
        onPrevious={handlePrevious}
      />
    </>
  );
};

// should not be default export, because we need to export multiple things
export { TimeLine, TextMsg, MediaMsg, ReplyMsg, LinkMsg, DocMsg, AudioMsg, DateDivider, AgentDivider, BotDivider, EscalationDivider, isDifferentDay, GroupedImageMsg }