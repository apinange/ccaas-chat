import { Avatar, Box, Typography,IconButton, Divider,Stack, } from '@mui/material'
import { CaretDown, MagnifyingGlass, Phone,VideoCamera } from 'phosphor-react'
import React, { useMemo } from 'react';
import { useTheme } from "@mui/material/styles";
import { useSearchParams } from 'react-router-dom';
import { useSelector } from 'react-redux';
import StyledBadge from '../StyledBadge';
import { ToggleSidebar } from '../../redux/slices/app';
import { useDispatch } from 'react-redux';
import createAvatar from '../../utils/createAvatar';

const Header = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get('conversation_id') || '17adfdec-e172-4394-a968-aab4119539b0';
  
  const { messages } = useSelector((store) => store.chat);
  
  // Pegar o nome do cliente apenas da conversa ativa da URL
  const clientName = useMemo(() => {
    // Normalizar conversationId (remover espaços e quebras de linha)
    const normalizedConversationId = conversationId?.trim();
    
    // Filtrar mensagens, normalizando conversation_id também
    const activeConversationMessages = messages.filter(msg => {
      const msgConvId = msg.conversation_id?.trim();
      return msgConvId === normalizedConversationId;
    });
    
    if (activeConversationMessages.length === 0) {
      return 'Cliente';
    }
    
    // Procurar em todas as mensagens da conversa por um client_name válido
    // Priorizar mensagens com client_name não vazio
    const messageWithClientName = activeConversationMessages.find(msg => {
      const name = msg.client_name;
      return name && 
             name !== null && 
             name !== undefined &&
             String(name).trim() !== '' &&
             String(name).trim() !== 'null' &&
             String(name).trim() !== 'undefined';
    });
    
    if (messageWithClientName?.client_name) {
      return String(messageWithClientName.client_name).trim();
    }
    
    return 'Cliente';
  }, [messages, conversationId]);
  
  // Criar avatar fixo baseado no nome do cliente
  const avatarData = useMemo(() => {
    return createAvatar(clientName);
  }, [clientName]);
  return (
    <Box p={2} sx={{ width:'100%', backgroundColor: theme.palette.mode === 'light' ? '#F8FAFF' : theme.palette.background.paper, boxShadow:'0px 0px 2px rgba(0,0,0,0.25)'}}>
    <Stack alignItems={'center'} direction='row' justifyContent={'space-between'}
    sx={{width:'100%', height:'100%'}}>
        <Stack onClick={()=>{
            dispatch(ToggleSidebar());
        }} direction={'row'} spacing={2}>
            <Box>
                <StyledBadge  overlap="circular"
                anchorOrigin={{ // position
                    vertical: "bottom",
                    horizontal: "right",
                }}
                variant="dot">
                    <Avatar alt={clientName} sx={{ bgcolor: theme.palette[avatarData.color]?.main || theme.palette.primary.main, color: '#fff' }}>
                        {avatarData.name}
                    </Avatar>
                </StyledBadge>
                
            </Box>
            <Stack spacing={0.2}>
                    <Typography variant='subtitle2'>
                        {clientName}
                    </Typography>
                    <Typography variant='caption'>
                        Online
                    </Typography>
                </Stack>
        </Stack>
        <Stack direction='row' alignItems='center' spacing={3}>
            <IconButton>
                <VideoCamera/>
            </IconButton>
            <IconButton>
                <Phone/>
            </IconButton>
            <IconButton>
                <MagnifyingGlass/>
            </IconButton>
            <Divider orientation='vertical' flexItem/>
            <IconButton>
                <CaretDown/>
            </IconButton>
        </Stack>
    </Stack>
</Box>
  )
}

export default Header