import { useEffect, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAllMessagesAsync, clearMessages } from '../redux/slices/chat';

/**
 * Hook para fazer polling de todas as mensagens
 * @param {number} interval - Intervalo em milissegundos (padrão: 3000ms = 3s)
 * @param {boolean} enabled - Se o polling está habilitado
 */
export const useChatPolling = (interval = 3000, enabled = true) => {
  const dispatch = useDispatch();
  const { polling } = useSelector((store) => store.chat);
  const intervalRef = useRef(null);
  
  useEffect(() => {
    if (!enabled) {
      return;
    }
    
    // Buscar todas as mensagens imediatamente ao montar
    dispatch(fetchAllMessagesAsync());
    
    // Configurar polling
    intervalRef.current = setInterval(() => {
      dispatch(fetchAllMessagesAsync());
    }, interval);
    
    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [enabled, interval, dispatch]);
  
  return { polling };
};

