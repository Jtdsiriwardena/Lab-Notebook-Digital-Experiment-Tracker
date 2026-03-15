import { useEffect, useRef, useState, useCallback } from 'react';

export function useWebSocket(experimentId) {
  const [isConnected, setIsConnected] = useState(false);
  const [activeCollaborators, setActiveCollaborators] = useState([]);
  const [typingUsers, setTypingUsers] = useState({});
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const pingIntervalRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const MAX_RECONNECT_ATTEMPTS = 5;

  const token = localStorage.getItem('token');

  const connect = useCallback(() => {
    if (!experimentId || !token) {
      console.log('Missing experimentId or token');
      return;
    }

    // Clear any existing reconnect timeout
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }

    const wsUrl = `ws://localhost:8000/ws/experiments/${experimentId}/?token=${token}`;
    console.log('Connecting to WebSocket:', wsUrl);
    
    const ws = new WebSocket(wsUrl);

    ws.onopen = () => {
      console.log('WebSocket connected successfully');
      setIsConnected(true);
      reconnectAttempts.current = 0; // Reset reconnect attempts on successful connection
      
      // Send ping every 30 seconds to keep connection alive
      pingIntervalRef.current = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: 'presence_ping' }));
        }
      }, 30000);
    };

    ws.onclose = (event) => {
      console.log('WebSocket disconnected:', event.code, event.reason);
      setIsConnected(false);
      
      // Clear intervals
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      
      // Attempt to reconnect with exponential backoff
      if (reconnectAttempts.current < MAX_RECONNECT_ATTEMPTS) {
        const delay = Math.min(1000 * Math.pow(2, reconnectAttempts.current), 10000);
        console.log(`Reconnecting in ${delay}ms (attempt ${reconnectAttempts.current + 1}/${MAX_RECONNECT_ATTEMPTS})`);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          reconnectAttempts.current += 1;
          connect();
        }, delay);
      } else {
        console.log('Max reconnection attempts reached');
      }
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      // The onclose handler will be called after this
    };

    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        // console.log('WebSocket message received:', data.type);
        
        switch (data.type) {
          case 'new_comment':
            if (window.onNewComment) {
              window.onNewComment(data.comment);
            }
            break;
            
          case 'user_typing':
            setTypingUsers(prev => {
              // Clear previous timeout for this user if exists
              if (prev[data.user_id]?.timeout) {
                clearTimeout(prev[data.user_id].timeout);
              }
              
              if (data.is_typing) {
                // Set new timeout to remove typing indicator after 3 seconds
                const timeout = setTimeout(() => {
                  setTypingUsers(current => {
                    const newState = { ...current };
                    delete newState[data.user_id];
                    return newState;
                  });
                }, 3000);
                
                return {
                  ...prev,
                  [data.user_id]: {
                    username: data.username,
                    timeout
                  }
                };
              } else {
                const newState = { ...prev };
                delete newState[data.user_id];
                return newState;
              }
            });
            break;
            
          case 'collaborator_joined':
            setActiveCollaborators(prev => {
              if (!prev.some(c => c.user_id === data.user_id)) {
                return [...prev, {
                  user_id: data.user_id,
                  username: data.username,
                  email: data.email
                }];
              }
              return prev;
            });
            break;
            
          case 'collaborator_left':
            setActiveCollaborators(prev => 
              prev.filter(c => c.user_id !== data.user_id)
            );
            
            // Also remove from typing users if they were typing
            setTypingUsers(prev => {
              const newState = { ...prev };
              delete newState[data.user_id];
              return newState;
            });
            break;
            
          case 'active_collaborators':
            setActiveCollaborators(data.collaborators);
            break;
            
          case 'presence_pong':
            // Connection is alive
            break;
            
          default:
            console.log('Unknown message type:', data.type);
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    };

    wsRef.current = ws;
  }, [experimentId, token]);

  useEffect(() => {
    connect();

    return () => {
      if (wsRef.current) {
        wsRef.current.close();
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (pingIntervalRef.current) {
        clearInterval(pingIntervalRef.current);
      }
      // Clear all typing timeouts
      Object.values(typingUsers).forEach(user => {
        if (user.timeout) clearTimeout(user.timeout);
      });
    };
  }, [connect]);

  const sendMessage = useCallback((message) => {
    if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
      return true;
    } else {
      console.warn('WebSocket is not connected');
      return false;
    }
  }, []);

  const sendComment = useCallback((content) => {
    return sendMessage({
      type: 'new_comment',
      content
    });
  }, [sendMessage]);

  const sendTyping = useCallback((isTyping) => {
    return sendMessage({
      type: 'typing',
      is_typing: isTyping
    });
  }, [sendMessage]);

  return {
    isConnected,
    activeCollaborators,
    typingUsers,
    sendComment,
    sendTyping,
    sendMessage,
    wsRef
  };
}