import { Box, Fab, IconButton, InputAdornment, Stack, TextField, Tooltip } from '@mui/material';
import React, { useState, useMemo } from 'react';
import { styled, useTheme } from "@mui/material/styles";
import { useSearchParams } from 'react-router-dom';
import { LinkSimple, PaperPlaneTilt, Smiley,Camera, File, Image, Sticker, User } from 'phosphor-react';
import { useDispatch, useSelector } from 'react-redux';
import { sendMessageAsync } from '../../redux/slices/chat';
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import uuidv4 from '../../utils/uuidv4'

const StyledInput = styled(TextField)(({ theme }) => ({
    "& .MuiInputBase-input": {
      paddingTop: '12px',
      paddingBottom: '12px',
    }  
  }));

  const Actions = [
    {
        color:'#4da5fe',
        icon: <Image size={24}/>,
        y:102,
        title:'Foto/Vídeo'
    },
    {
        color:'#1b8cfe',
        icon: <Sticker size={24}/>,
        y:172,
        title:'Figurinhas'
    },
    {
        color:'#0172e4',
        icon: <Camera size={24}/>,
        y:242,
        title:'Imagem'
    },
    {
        color:'#0159b2',
        icon: <File size={24}/>,
        y:312,
        title:'Documento'
    },
    {
        color:'#013f7f',
        icon: <User size={24}/>,
        y:382,
        title:'Contato'
    }
  ];

const ChatInput = ({setOpenPicker, inputValue, setInputValue, onKeyPress, disabled, onSend, sending}) =>{
    const [openAction, setOpenAction] = useState(false);
    const theme = useTheme();
    return (
        <StyledInput 
            fullWidth 
            placeholder={disabled ? 'Aguardando escalação...' : 'Digite uma mensagem...'} 
            variant='filled' 
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={onKeyPress}
            disabled={disabled}
            InputProps={{
            disableUnderline: true,
            startAdornment: 
            <Stack sx={{width:'max-content'}}>
                <Stack sx={{position:'relative', display: openAction ? 'inline-block' : 'none'}}>
                    {Actions.map((el, index)=>(
                        <Tooltip key={index} placement='right' title={el.title}>
                            <Fab sx={{position:'absolute', top: -el.y, backgroundColor: el.color}}>
                                {el.icon}
                            </Fab>
                        </Tooltip>
                      
                    ))}
                </Stack>
                <InputAdornment>
                    <IconButton onClick={()=>{
                        setOpenAction((prev)=>!prev)
                    }} disabled={disabled}>
                        <LinkSimple/>
                    </IconButton>
                </InputAdornment>
            </Stack>
            ,
            endAdornment: <Stack direction='row' spacing={0.5} alignItems='center'>
                <InputAdornment>
                    <IconButton onClick={()=>{
                        setOpenPicker((prev)=> !prev);
                    }} disabled={disabled}>
                        <Smiley/>
                    </IconButton>
                </InputAdornment>
                <Box sx={{
                    height:32, 
                    width: 32, 
                    backgroundColor: inputValue.trim() ? theme.palette.primary.main : theme.palette.action.disabledBackground,
                    borderRadius: '50%', 
                    mr: 0.5,
                    opacity: inputValue.trim() ? 1 : 0.75,
                    transition: 'background-color 0.2s, opacity 0.2s'
                }}>
                    <Stack sx={{height:'100%', width:'100%', alignItems:'center', justifyContent:'center'}}>
                        <IconButton 
                            onClick={onSend} 
                            disabled={sending || disabled || !inputValue.trim()} 
                            sx={{ padding: 0 }}
                        >
                            <PaperPlaneTilt color='#fff' size={18}/>
                        </IconButton>
                    </Stack>
                </Box>
            </Stack>
        }}/>
    )
}

const Footer = () => {
    const theme = useTheme();
    const dispatch = useDispatch();
    const [openPicker, setOpenPicker] = useState(false);
    const [inputValue, setInputValue] = useState('');
    const [searchParams] = useSearchParams();
    const { sending, messages } = useSelector((store) => store.chat);
    
    // Pegar conversation_id da URL
    const conversationId = searchParams.get('conversation_id') || '17adfdec-e172-4394-a968-aab4119539b0';
    
    // Default values (in production, get from user context)
    const defaultUserId = '558184475278';
    
    // Verificar se há mensagem de escalação ou agente na conversa atual
    const hasEscalationOrAgentMessage = useMemo(() => {
        const normalizedConversationId = conversationId?.trim();
        
        const activeConversationMessages = messages.filter(msg => {
            const msgConvId = msg.conversation_id?.trim();
            return msgConvId === normalizedConversationId;
        });
        
        return activeConversationMessages.some(msg => 
            msg.flag === 'ESCALATION' || msg.flag === 'AGENT'
        );
    }, [messages, conversationId]);
    
    // Obter client_name da conversa atual (mesma lógica do Header)
    const clientName = useMemo(() => {
        const normalizedConversationId = conversationId?.trim();
        
        const activeConversationMessages = messages.filter(msg => {
            const msgConvId = msg.conversation_id?.trim();
            return msgConvId === normalizedConversationId;
        });
        
        if (activeConversationMessages.length === 0) {
            return null;
        }
        
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
        
        return null;
    }, [messages, conversationId]);
    
    const handleSendMessage = async () => {
        if (!inputValue.trim() && !inputValue) {
            return;
        }
        
        // Salvar o texto antes de limpar o input
        const messageText = inputValue;
        
        // Limpar input imediatamente para melhor UX
        setInputValue('');
        
        const messageData = {
            message_id: uuidv4().replace(/-/g, '').toUpperCase(),
            conversation_id: conversationId,
            user_id: defaultUserId,
            text: messageText,
            timestamp: new Date().toISOString(),
            client_name: clientName || null, // Incluir client_name se disponível
        };
        
        try {
            // Enviar mensagem (não esperar resposta para melhor UX)
            dispatch(sendMessageAsync({ 
                messageData, 
                audioFiles: [], 
                imageFiles: [] 
            })).catch((error) => {
                console.error('Error sending message:', error);
                // Se houver erro, restaurar o texto no input
                setInputValue(messageText);
            });
        } catch (error) {
            console.error('Error sending message:', error);
            // Se houver erro, restaurar o texto no input
            setInputValue(messageText);
        }
    };
    
    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };
    
  return (
    <Box p={2} sx={{ width:'100%', backgroundColor: theme.palette.mode === 'light' ? '#F8FAFF' :
     theme.palette.background.paper, boxShadow:'0px 0px 2px rgba(0,0,0,0.25)'}}>
    <Stack direction='row' alignItems={'center'} spacing={2}>

        <Stack sx={{width:'100%'}}> 
             {/* Chat Input */}
            <Box sx={{ display: openPicker ? 'inline' : 'none' , zIndex:10, position:'fixed',bottom:81, right:100}}>
                <Picker theme={theme.palette.mode} data={data} onEmojiSelect={(emoji) => {
                    setInputValue(prev => prev + emoji.native);
                    setOpenPicker(false);
                }}/>
            </Box> 
            <ChatInput 
                setOpenPicker={setOpenPicker} 
                inputValue={inputValue} 
                setInputValue={setInputValue} 
                onKeyPress={handleKeyPress} 
                disabled={!hasEscalationOrAgentMessage}
                onSend={handleSendMessage}
                sending={sending}
            />
        </Stack>
    </Stack>
</Box>
  )
}

export default Footer