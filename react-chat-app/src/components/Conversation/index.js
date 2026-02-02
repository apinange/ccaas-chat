import { Box, Stack } from '@mui/material';
import React, { useEffect, useRef } from 'react';
import { useTheme } from "@mui/material/styles";
import { useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setCurrentConversation } from '../../redux/slices/chat';
import { useChatPolling } from '../../hooks/useChatPolling';
import Header from './Header';
import Footer from './Footer';
import Message from './Message';

const Conversation = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();
  const scrollContainerRef = useRef(null);
  
  // Pegar conversation_id da URL query param
  const conversationId = searchParams.get('conversation_id') || '17adfdec-e172-4394-a968-aab4119539b0';
  
  useEffect(() => {
    dispatch(setCurrentConversation(conversationId));
  }, [conversationId, dispatch]);
  
  // Iniciar polling de todas as mensagens quando componente montar
  useChatPolling(3000, true);
  
  return (
    <Stack height={'100%'} maxHeight={'100vh'} width={'auto'}>

        {/* Chat header */}
        <Header/>
        {/* Msg */}
        <Box 
          ref={scrollContainerRef}
          className='scrollbar' 
          width={"100%"} 
          sx={{
            flexGrow:1, 
            height:'100%', 
            overflowY:'scroll',
            position: 'relative',
            backgroundColor: theme.palette.mode === 'light' ? '#F0F4FA' : theme.palette.background.default,
            backgroundImage: theme.palette.mode === 'light' 
              ? `linear-gradient(rgba(240, 244, 250, 0.5), rgba(240, 244, 250, 0.5)), url(/chat-background.png)`
              : `linear-gradient(${theme.palette.background.default}CC, ${theme.palette.background.default}CC), url(/chat-background.png)`,
            backgroundSize: '100% auto',
            backgroundPosition: 'top center',
            backgroundRepeat: 'repeat-y',
            backgroundAttachment: 'local',
            '& > *': {
              position: 'relative',
              zIndex: 1
            }
          }}
        >
        <Message menu={true} containerRef={scrollContainerRef}/>
        </Box>
        {/* Chat footer */}
       <Footer/>
    </Stack>
  )
}

export default Conversation