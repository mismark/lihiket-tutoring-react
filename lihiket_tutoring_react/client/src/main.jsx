import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';

import App from './App';
import { AuthProvider }         from './store/auth/AuthContext';
import { ThemeProvider }        from './store/theme/ThemeContext';
import { NotificationProvider } from './store/notifications/NotificationContext';
import { SidebarProvider }      from './store/sidebar/SidebarContext';
import { ChatProvider }         from './store/chat/ChatContext';
import { SocketProvider }       from './store/socket/SocketContext';
import './styles/index.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,   // 5 min
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <SidebarProvider>
            <AuthProvider>
              <SocketProvider>
                <NotificationProvider>
                  <ChatProvider>
                    <App />
                    <Toaster
                      position="top-right"
                      toastOptions={{
                        duration: 4000,
                        style: { borderRadius: '10px', fontSize: '14px' },
                        success: { iconTheme: { primary: '#2563eb', secondary: '#fff' } },
                      }}
                    />
                  </ChatProvider>
                </NotificationProvider>
              </SocketProvider>
            </AuthProvider>
          </SidebarProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </BrowserRouter>
  </React.StrictMode>
);
