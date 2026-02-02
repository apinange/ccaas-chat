import { Box, IconButton, Stack, Typography, InputBase, Button, Divider, Avatar, Badge } from
  '@mui/material'
import { ArchiveBox, CircleDashed, MagnifyingGlass } from 'phosphor-react';
import {useTheme } from '@mui/material/styles';
import React, { useEffect, useState, useRef, useCallback } from 'react';
import { faker } from '@faker-js/faker';
import {ChatList} from '../../data';
import { Search, SearchIconWrapper, StyledInputBase } from '../../components/Search';
import ChatElement from '../../components/ChatElement';
import { getConversations } from '../../services/api';
import { useNavigate, useSearchParams } from 'react-router-dom';

const Chats = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const intervalRef = useRef(null);

  const fetchConversations = useCallback(async (showLoading = false) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const response = await getConversations();
      if (response.status === 'success') {
        const conversationsData = response.data || [];
        
        // Remover duplicatas baseado no conversation_id normalizado
        const uniqueConversations = conversationsData.reduce((acc, conversation) => {
          const normalizedId = conversation.conversation_id?.trim();
          if (!normalizedId) return acc;
          
          // Verificar se já existe uma conversa com esse ID normalizado
          const existingIndex = acc.findIndex(
            c => c.conversation_id?.trim() === normalizedId
          );
          
          if (existingIndex === -1) {
            // Adicionar nova conversa com ID normalizado
            acc.push({
              ...conversation,
              conversation_id: normalizedId
            });
          } else {
            // Se já existe, manter a que tem mais mensagens ou timestamp mais recente
            const existing = acc[existingIndex];
            if (
              conversation.message_count > existing.message_count ||
              (conversation.last_created_at > existing.last_created_at && 
               conversation.message_count === existing.message_count)
            ) {
              acc[existingIndex] = {
                ...conversation,
                conversation_id: normalizedId
              };
            }
          }
          
          return acc;
        }, []);
        
        setConversations(uniqueConversations);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
      // Don't show error if it's just a connection issue (server not running)
      // The error is already logged to console
      if (error.message && error.message.includes('Não foi possível conectar')) {
        console.warn('[Chats] Server connection issue - this is expected if the server is not running');
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    let serverAvailable = true;
    
    // Buscar conversas imediatamente ao montar (com loading)
    fetchConversations(true).catch((error) => {
      if (error.message && error.message.includes('Não foi possível conectar')) {
        serverAvailable = false;
        console.warn('[Chats] Server not available, stopping polling');
      }
    });
    
    // Configurar polling para atualizar a lista de conversas a cada 3 segundos (sem loading)
    // Só continua se o servidor estiver disponível
    intervalRef.current = setInterval(() => {
      if (isMounted && serverAvailable) {
        fetchConversations(false).catch((error) => {
          if (error.message && error.message.includes('Não foi possível conectar')) {
            serverAvailable = false;
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            console.warn('[Chats] Server connection lost, stopping polling');
          }
        });
      }
    }, 3000);
    
    // Cleanup: limpar o intervalo quando o componente desmontar
    return () => {
      isMounted = false;
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [fetchConversations]);

  const handleConversationClick = (conversationId) => {
    navigate(`/app?conversation_id=${conversationId}`);
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'Agora';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    if (days < 7) return `${days}d`;
    return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
  };

  const formatConversationName = (conversation) => {
    if (conversation.client_name && conversation.client_name.trim() !== '') {
      return conversation.client_name;
    }
    return `Conversa ${conversation.conversation_id.substring(0, 8)}`;
  };

  const truncateMessage = (message, maxLength = 20) => {
    if (!message) return 'Sem mensagens';
    if (message.length <= maxLength) return message;
    return message.substring(0, maxLength).trim() + '...';
  };

  return (    
    <Box sx={{
      position: "relative", width: 320, 
      backgroundColor: theme.palette.mode === 'light'? "#F8FAFF" : theme.palette.background.paper,
      boxShadow: '0px 0px 2px rgba(0,0,0,0.25)'
    }}>
      <Stack p={3} spacing={2} sx={{height:"100vh"}}>
        <Stack direction="row" alignItems='center' justifyContent='space-between'>
          <Typography variant='h5'>
            Chats
          </Typography>
          <IconButton>
            <CircleDashed />
          </IconButton>
        </Stack>

        <Stack sx={{ width: "100%" }}>
          <Search>
            <SearchIconWrapper>
              <MagnifyingGlass color="#709CE6" />
            </SearchIconWrapper>
            <StyledInputBase placeholder='Pesquisar...' inputProps={{ "aria-label": "search" }} />
          </Search>
        </Stack>

        <Stack spacing={1}>
          <Stack direction='row' alignItems='center' spacing={1.5}>
            <ArchiveBox size={24} />
            <Button>
              Arquivadas
            </Button>
          </Stack>
          <Divider />
        </Stack>

        <Stack className='scrollbar' spacing={2} direction='column' sx={{flexGrow:1, overflowY:'scroll', overflowX:'hidden', height:'100%'}}>
          {/* Conversas do Banco de Dados */}
          {!loading && conversations.length > 0 && (
            <Stack spacing={2.4}>
              <Typography variant='subtitle2' sx={{color:"#676767"}}>
                Conversas
              </Typography>
              {conversations.map((conversation) => {
                const isActive = searchParams.get('conversation_id') === conversation.conversation_id;
                return (
                  <ChatElement
                    key={conversation.conversation_id}
                    id={conversation.conversation_id}
                    name={formatConversationName(conversation)}
                    msg={truncateMessage(conversation.last_message_text)}
                    time={formatTime(conversation.last_message_time)}
                    conversation_id={conversation.conversation_id}
                    onClick={() => handleConversationClick(conversation.conversation_id)}
                    sx={isActive ? {
                      backgroundColor: theme.palette.primary.lighter,
                    } : {}}
                  />
                );
              })}
            </Stack>
          )}

            <Stack spacing={2.4}>
              <Typography variant='subtitle2' sx={{color:"#676767"}}>
                Pinned
              </Typography>
              {ChatList.filter((el)=> el.pinned).map((el)=>{
                return <ChatElement  {...el} key={el.id}/>
              })}
              
            </Stack>
          
          <Stack spacing={2.4}>
            <Typography variant='subtitle2' sx={{color:"#676767"}}>
              All Chats
            </Typography>
            {ChatList.filter((el)=> !el.pinned).map((el)=>{
              return <ChatElement {...el} key={el.id}/>
            })}
            
          </Stack>
          
        </Stack>
      </Stack>

    </Box>
  )
}

export default Chats