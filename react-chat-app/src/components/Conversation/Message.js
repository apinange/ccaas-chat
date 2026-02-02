import { Box, Stack } from '@mui/material'
import React, { useEffect, useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useSearchParams } from 'react-router-dom';
import {Chat_History} from '../../data'
import { DocMsg, LinkMsg, MediaMsg, ReplyMsg, TextMsg, AudioMsg, TimeLine, DateDivider, AgentDivider, BotDivider, EscalationDivider, isDifferentDay, GroupedImageMsg } from './MsgTypes';

const Message = ({menu, containerRef}) => {
  const [searchParams] = useSearchParams();
  const conversationId = searchParams.get('conversation_id') || '17adfdec-e172-4394-a968-aab4119539b0';
  const previousMessagesCountRef = useRef(0);
  const shouldAutoScrollRef = useRef(true);
  const isInitialLoadRef = useRef(true);
  
  // Get messages from Redux store
  const { messages } = useSelector((store) => store.chat);
  const messagesEndRef = useRef(null);
  
  // Filtrar mensagens apenas da conversa ativa (normalizar IDs para lidar com whitespace)
  const filteredMessages = useMemo(() => {
    if (messages.length === 0) return Chat_History;
    const normalizedConversationId = conversationId?.trim();
    return messages.filter(msg => {
      const msgConvId = msg.conversation_id?.trim();
      return msgConvId === normalizedConversationId;
    });
  }, [messages, conversationId]);
  
  // Check if user is near bottom of scroll (since newest messages are at bottom)
  const isNearBottom = () => {
    if (!containerRef?.current) return true;
    const container = containerRef.current;
    const scrollTop = container.scrollTop;
    const scrollHeight = container.scrollHeight;
    const clientHeight = container.clientHeight;
    const threshold = 150; // 150px from bottom
    return scrollHeight - scrollTop - clientHeight < threshold;
  };
  
  // Handle scroll events to detect user scrolling
  useEffect(() => {
    const container = containerRef?.current;
    if (!container) return;
    
    const handleScroll = () => {
      shouldAutoScrollRef.current = isNearBottom();
    };
    
    container.addEventListener('scroll', handleScroll);
    return () => container.removeEventListener('scroll', handleScroll);
  }, [containerRef]);
  
  // Scroll to bottom only if user is near bottom or if it's a new message count (newest messages are at bottom)
  useEffect(() => {
    const currentCount = filteredMessages.length;
    const previousCount = previousMessagesCountRef.current;
    
    // If it's the first load, always scroll to bottom
    if (isInitialLoadRef.current && currentCount > 0) {
      isInitialLoadRef.current = false;
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'auto' });
      }, 100);
      previousMessagesCountRef.current = currentCount;
      return;
    }
    
    // If message count increased and user is near bottom, scroll to bottom
    if (currentCount > previousCount && shouldAutoScrollRef.current) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    }
    
    previousMessagesCountRef.current = currentCount;
  }, [filteredMessages.length]);
  
  // Use filtered messages
  const messagesToDisplay = filteredMessages;
  
  // Helper function to check if message is image-only (no text)
  const isImageOnlyMessage = (msg) => {
    if (msg.type !== 'msg' || msg.subtype !== 'img') return false;
    const hasText = msg.message && msg.message.trim().length > 0;
    const hasImages = (msg.imageFiles && msg.imageFiles.length > 0) || msg.img;
    return hasImages && !hasText;
  };
  
  // Group consecutive image-only messages
  const groupImageMessages = useMemo(() => {
    const grouped = [];
    let currentGroup = [];
    
    messagesToDisplay.forEach((msg, index) => {
      const prevMsg = index > 0 ? messagesToDisplay[index - 1] : null;
      const isImageOnly = isImageOnlyMessage(msg);
      
      // Check if we should continue grouping
      const shouldGroup = isImageOnly && 
        prevMsg && 
        isImageOnlyMessage(prevMsg) &&
        msg.flag === prevMsg.flag &&
        msg.incoming === prevMsg.incoming &&
        currentGroup.length > 0 &&
        currentGroup.length < 4; // Max 4 images per group
      
      if (shouldGroup) {
        // Continue current group
        currentGroup.push(msg);
      } else {
        // Finish current group if exists (only if more than 1 message)
        if (currentGroup.length > 1) {
          grouped.push({
            type: 'groupedImage',
            messages: [...currentGroup],
            key: `grouped-${currentGroup[0].message_id}-${currentGroup.length}`
          });
        } else if (currentGroup.length === 1) {
          // Single image message, add as regular message
          grouped.push(currentGroup[0]);
        }
        currentGroup = [];
        
        // Start new group or add single message
        if (isImageOnly) {
          currentGroup = [msg];
        } else {
          grouped.push(msg);
        }
      }
    });
    
    // Don't forget the last group
    if (currentGroup.length > 1) {
      grouped.push({
        type: 'groupedImage',
        messages: [...currentGroup],
        key: `grouped-${currentGroup[0].message_id}-${currentGroup.length}`
      });
    } else if (currentGroup.length === 1) {
      // Single image message, add as regular message
      grouped.push(currentGroup[0]);
    }
    
    return grouped;
  }, [messagesToDisplay]);
  
  // Create messages with date dividers, bot dividers, and agent dividers
  const messagesWithDividers = useMemo(() => {
    const result = [];
    let hasSeenAgentMessage = false;
    let hasSeenBotOrUserMessage = false;
    let hasShownBotDivider = false;
    
    // Check if there are any AGENT messages in the conversation
    const hasAgentMessages = groupImageMessages.some(msg => 
      (msg.type === 'msg' && msg.flag === 'AGENT') ||
      (msg.type === 'groupedImage' && msg.messages[0]?.flag === 'AGENT')
    );
    
    // Helper function to get flag from result items
    const getFlagFromResult = (item) => {
      if (!item) return null;
      if (item.type === 'msg') {
        const flag = item.flag;
        if (!flag || typeof flag !== 'string') return null;
        return flag.trim().toUpperCase();
      }
      if (item.type === 'groupedImage') {
        const flag = item.messages[0]?.flag;
        if (!flag || typeof flag !== 'string') return null;
        return flag.trim().toUpperCase();
      }
      return null;
    };
    
    // Helper function to find the last message (not divider) in result
    const getLastMessageInResult = (resultArray) => {
      for (let i = resultArray.length - 1; i >= 0; i--) {
        const item = resultArray[i];
        if (item.type === 'msg' || item.type === 'groupedImage') {
          return item;
        }
      }
      return null;
    };
    
    groupImageMessages.forEach((el, index) => {
      // Get timestamp for date divider check
      const getTimestamp = (item) => {
        if (item.type === 'msg') return item.timestamp;
        if (item.type === 'groupedImage') return item.messages[0]?.timestamp;
        return null;
      };
      
      // Get flag for divider checks
      const getFlag = (item) => {
        if (item.type === 'msg') {
          // Garantir que flag seja uma string válida e não undefined/null
          const flag = item.flag;
          if (!flag || typeof flag !== 'string') return null;
          return flag.trim().toUpperCase();
        }
        if (item.type === 'groupedImage') {
          const flag = item.messages[0]?.flag;
          if (!flag || typeof flag !== 'string') return null;
          return flag.trim().toUpperCase();
        }
        return null;
      };
      
      const timestamp = getTimestamp(el);
      const flag = getFlag(el);
      
      // Add date divider if this is the first message or if the day changed
      if (timestamp) {
        const prevItem = index > 0 ? groupImageMessages[index - 1] : null;
        const prevTimestamp = prevItem ? getTimestamp(prevItem) : null;
        const shouldAddDateDivider = 
          index === 0 || 
          (prevTimestamp && isDifferentDay(prevTimestamp, timestamp));
        
        if (shouldAddDateDivider) {
          result.push({
            type: 'dateDivider',
            timestamp: timestamp,
            key: `date-divider-${timestamp}-${index}`
          });
        }
      }
      
      // Add bot divider before first BOT or USER message (only if no AGENT messages exist)
      if (flag && (flag === 'BOT' || flag === 'USER') && !hasSeenBotOrUserMessage && !hasAgentMessages && !hasShownBotDivider) {
        hasSeenBotOrUserMessage = true;
        hasShownBotDivider = true;
        const messageId = el.type === 'msg' ? el.message_id : el.messages[0]?.message_id;
        result.push({
          type: 'botDivider',
          key: `bot-divider-${messageId || index}`
        });
      }
      
      // Add agent divider before first AGENT message
      if (flag === 'AGENT' && !hasSeenAgentMessage) {
        hasSeenAgentMessage = true;
        const messageId = el.type === 'msg' ? el.message_id : el.messages[0]?.message_id;
        result.push({
          type: 'agentDivider',
          key: `agent-divider-${messageId || index}`
        });
      }
      
      // Add escalation divider before ESCALATION message
      // REGRA: O card de escalação só aparece para mensagens ESCALATION reais (mesmo que vazias)
      // Mensagens AGENT, USER e BOT NUNCA devem mostrar o card de escalação
      // Verificação rigorosa: flag deve ser EXATAMENTE 'ESCALATION'
      if (flag === 'ESCALATION') {
        // Mensagens ESCALATION podem ser vazias - isso é normal
        // Se for vazia, mostra apenas o card (divider), não a mensagem
        const hasContent = (item) => {
          if (item.type === 'msg') {
            const hasText = item.message && item.message.trim().length > 0;
            const hasImages = (item.imageFiles && item.imageFiles.length > 0) || item.img;
            const hasAudio = (item.audioFiles && item.audioFiles.length > 0) || item.audio;
            return hasText || hasImages || hasAudio;
          }
          if (item.type === 'groupedImage') {
            return item.messages && item.messages.length > 0;
          }
          return false;
        };
        
        // Mostrar o card de escalação apenas uma vez, antes da primeira mensagem ESCALATION
        // Se a mensagem anterior também é ESCALATION, não mostrar o card novamente
        const prevItem = index > 0 ? groupImageMessages[index - 1] : null;
        const prevFlag = prevItem ? getFlag(prevItem) : null;
        
        if (prevFlag !== 'ESCALATION') {
          // Mostrar o card de escalação apenas se a mensagem anterior não é ESCALATION
          const messageId = el.type === 'msg' ? el.message_id : el.messages[0]?.message_id;
          result.push({
            type: 'escalationDivider',
            key: `escalation-divider-${messageId || index}`
          });
        }
        
        // Se a mensagem ESCALATION tem conteúdo, adicionar a mensagem também
        // Se for vazia, apenas o card já foi mostrado acima
        if (hasContent(el)) {
          // Check if previous message (not divider) in result has same flag
          const prevMessage = getLastMessageInResult(result);
          const prevResultFlag = getFlagFromResult(prevMessage);
          const isConsecutiveSameRole = prevResultFlag === flag;
          
          result.push({
            ...el,
            isConsecutiveSameRole
          });
        }
        
        // Retornar para não processar mais nada desta mensagem
        return;
      }
      
      // Mensagens AGENT, USER e BOT: adicionar normalmente, SEM card de escalação
      // (o código continua abaixo para adicionar a mensagem)
      
      // Check if previous message (not divider) in result has same flag (for consecutive same role spacing)
      const prevMessage = getLastMessageInResult(result);
      const prevResultFlag = getFlagFromResult(prevMessage);
      const isConsecutiveSameRole = prevResultFlag === flag && (flag === 'AGENT' || flag === 'USER' || flag === 'BOT');
      
      // Add the message itself or grouped images with consecutive flag
      result.push({
        ...el,
        isConsecutiveSameRole
      });
    });
    
    return result;
  }, [groupImageMessages]);
  
  return (
    <Box p={3} pt={10}>
      <Stack spacing={0}>
        {messagesWithDividers.map((el, index) => {
          // Determine spacing based on whether it's a consecutive same role message
          const spacing = el.isConsecutiveSameRole ? 0.5 : 3;
          const isDivider = el.type === 'dateDivider' || el.type === 'agentDivider' || 
                           el.type === 'botDivider' || el.type === 'escalationDivider' || 
                           el.type === 'divider';
          
          // For dividers, use default spacing (3), for messages use calculated spacing
          const marginTop = index === 0 ? 0 : (isDivider ? 3 : spacing);
          
          const content = (() => {
            switch (el.type) {
              case 'divider':
                return <TimeLine key={`divider-${index}`} el={el}/>
                
              case 'dateDivider':
                return <DateDivider key={el.key || `date-divider-${index}`} timestamp={el.timestamp} />
                
              case 'agentDivider':
                return <AgentDivider key={el.key || `agent-divider-${index}`} />
                
              case 'botDivider':
                return <BotDivider key={el.key || `bot-divider-${index}`} />
                
              case 'escalationDivider':
                return <EscalationDivider key={el.key || `escalation-divider-${index}`} />
                
              case 'groupedImage':
                return <GroupedImageMsg key={el.key || `grouped-${index}`} messages={el.messages} menu={menu}/>
                
              case 'msg':
                switch (el.subtype) {
                  case 'img':
                    return <MediaMsg key={el.message_id || `msg-${index}`} el={el} menu={menu}/>
                  case 'doc':
                    return <DocMsg key={el.message_id || `msg-${index}`} el={el} menu={menu}/>
                  case 'link':
                    return <LinkMsg key={el.message_id || `msg-${index}`} el={el} menu={menu}/>
                  case 'reply':
                    return <ReplyMsg key={el.message_id || `msg-${index}`} el={el} menu={menu}/>
                  case 'audio':
                    return <AudioMsg key={el.message_id || `msg-${index}`} el={el} menu={menu}/>
                  default:
                    return <TextMsg key={el.message_id || `msg-${index}`} el={el} menu={menu}/>
                }
                
              default:
                return <></>;
            }
          })();
          
          return (
            <Box key={el.key || `item-${index}`} sx={{ mt: marginTop }}>
              {content}
            </Box>
          );
        })}
        <div ref={messagesEndRef} />
      </Stack>
    </Box>
  )
}

export default Message