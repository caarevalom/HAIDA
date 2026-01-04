import { ThemeProvider } from './components/theme-provider';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { ProtectedRoute } from './components/ProtectedRoute';
import { useState, useEffect, lazy, Suspense } from 'react';

// Lazy load pages for better code splitting
const Dashboard = lazy(() => import('./pages/Dashboard').then(m => ({ default: m.Dashboard })));
const Chat = lazy(() => import('./pages/Chat').then(m => ({ default: m.Chat })));
const Login = lazy(() => import('./pages/Login').then(m => ({ default: m.Login })));
const Documentation = lazy(() => import('./pages/Documentation').then(m => ({ default: m.Documentation })));
const Projects = lazy(() => import('./pages/Projects').then(m => ({ default: m.Projects })));
const Designer = lazy(() => import('./pages/Designer').then(m => ({ default: m.Designer })));
const Executor = lazy(() => import('./pages/Executor').then(m => ({ default: m.Executor })));
const Reporter = lazy(() => import('./pages/Reporter').then(m => ({ default: m.Reporter })));
const Profile = lazy(() => import('./pages/Profile').then(m => ({ default: m.Profile })));
const StyleGuide = lazy(() => import('./components/StyleGuide').then(m => ({ default: m.StyleGuide })));
import { Home, Folder, MessageSquare, PenTool, PlayCircle, BarChart3 } from 'lucide-react';
import { cn } from './components/ui/utils';
import { DataProvider } from './lib/data-context';
import { UiProvider } from './lib/ui-context';
import { LanguageProvider } from './lib/i18n-context';
import { AuthProvider, useAuth } from './lib/auth-context';
import { Toaster } from './components/ui/sonner';
import { monitoring, trackPageView } from './lib/monitoring';

export default function App() {
  const [currentPage, setCurrentPage] = useState('login');

  const isLoginPage = currentPage === 'login';

  // Track page views
  useEffect(() => {
    trackPageView(currentPage);
  }, [currentPage]);

  // Log performance metrics on mount
  useEffect(() => {
    // Wait for page to fully load
    if (document.readyState === 'complete') {
      monitoring.logPerformance();
    } else {
      window.addEventListener('load', () => monitoring.logPerformance());
    }
  }, []);

  const renderPage = () => {
    const handleLogout = () => {
      setCurrentPage('login');
    };

    const handleUnauthorized = () => {
      setCurrentPage('login');
    };

    switch (currentPage) {
      case 'login':
        return <Login onLogin={() => setCurrentPage('dashboard')} />;
      case 'dashboard':
        return (
          <ProtectedRoute onUnauthorized={handleUnauthorized}>
            <Dashboard />
          </ProtectedRoute>
        );
      case 'chat':
        return (
          <ProtectedRoute onUnauthorized={handleUnauthorized}>
            <Chat />
          </ProtectedRoute>
        );
      case 'projects':
        return (
          <ProtectedRoute onUnauthorized={handleUnauthorized}>
            <Projects />
          </ProtectedRoute>
        );
      case 'designer':
        return (
          <ProtectedRoute onUnauthorized={handleUnauthorized} requiredRole="qa_engineer">
            <Designer />
          </ProtectedRoute>
        );
      case 'executor':
        return (
          <ProtectedRoute onUnauthorized={handleUnauthorized} requiredRole="qa_engineer">
            <Executor />
          </ProtectedRoute>
        );
      case 'reporter':
        return (
          <ProtectedRoute onUnauthorized={handleUnauthorized}>
            <Reporter />
          </ProtectedRoute>
        );
      case 'profile':
        return (
          <ProtectedRoute onUnauthorized={handleUnauthorized}>
            <Profile onLogout={handleLogout} />
          </ProtectedRoute>
        );
      case 'docs':
        return (
          <ProtectedRoute onUnauthorized={handleUnauthorized}>
            <Documentation />
          </ProtectedRoute>
        );
      case 'styleguide':
        return (
          <ProtectedRoute onUnauthorized={handleUnauthorized} requiredRole="developer">
            <StyleGuide />
          </ProtectedRoute>
        );
      default:
        return (
          <ProtectedRoute onUnauthorized={handleUnauthorized}>
            <Dashboard />
          </ProtectedRoute>
        );
    }
  };

  const navItems = [
    { name: 'Dashboard', value: 'dashboard', icon: <Home className="h-5 w-5" /> },
    { name: 'Projects', value: 'projects', icon: <Folder className="h-5 w-5" /> },
    { name: 'Designer', value: 'designer', icon: <PenTool className="h-5 w-5" /> },
    { name: 'Executor', value: 'executor', icon: <PlayCircle className="h-5 w-5" /> },
    { name: 'Reporter', value: 'reporter', icon: <BarChart3 className="h-5 w-5" /> },
    { name: 'Chat IA', value: 'chat', icon: <MessageSquare className="h-5 w-5" /> },
  ];

  return (
    <AuthProvider>
      <DataProvider>
        <UiProvider>
          <LanguageProvider>
            <ThemeProvider defaultTheme="light" enableSystem disableTransitionOnChange>
              {/* Global Styles Injection for Scrollbar Hiding */}
              <style
                dangerouslySetInnerHTML={{
                  __html: `
            /* Hide scrollbar for Chrome, Safari and Opera */
            .no-scrollbar::-webkit-scrollbar {
              display: none;
              width: 0px;
              background: transparent;
            }
            
            /* Hide scrollbar for IE, Edge and Firefox */
            .no-scrollbar {
              -ms-overflow-style: none;  /* IE and Edge */
              scrollbar-width: none;  /* Firefox */
            }
            
            /* Ensure body doesn't scroll double */
            body {
              overflow: hidden;
              width: 100%;
              height: 100%;
              position: fixed;
            }
          `,
                }}
              />

              <div className="flex flex-col h-[100dvh] bg-background text-foreground font-sans antialiased overflow-hidden">
                {/* Ambient Background Glows */}
                <div className="fixed top-[-20%] right-[-10%] w-[50%] h-[50%] bg-primary/15 blur-[120px] rounded-full pointer-events-none z-0 mix-blend-screen dark:mix-blend-lighten opacity-50" />
                <div className="fixed bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-accent/15 blur-[100px] rounded-full pointer-events-none z-0 mix-blend-screen dark:mix-blend-lighten opacity-50" />

                {/* Main Content Area */}
                <div className="flex-1 flex flex-col h-full overflow-hidden relative z-10">
                  {!isLoginPage && <Header onNavigate={setCurrentPage} currentPage={currentPage} />}

                  {/* Scrollable Container with Hidden Scrollbar */}
                  <main
                    className={cn(
                      'flex-1 overflow-y-auto no-scrollbar scroll-smooth',
                      isLoginPage ? '' : 'pb-20 md:pb-0'
                    )}
                  >
                    <Suspense
                      fallback={
                        <div className="flex items-center justify-center h-full">
                          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                        </div>
                      }
                    >
                      {renderPage()}
                    </Suspense>
                  </main>
                </div>

                {/* Bottom Nav for Mobile */}
                {!isLoginPage && (
                  <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 glass border-t border-white/20 z-50 flex items-center justify-around px-2 pb-safe bg-background/80 backdrop-blur-lg">
                    {navItems.slice(0, 5).map((item) => (
                      <button
                        key={item.value}
                        onClick={() => setCurrentPage(item.value)}
                        className={cn(
                          'flex flex-col items-center justify-center w-full h-full space-y-1 transition-colors relative',
                          currentPage === item.value
                            ? 'text-primary'
                            : 'text-muted-foreground hover:text-foreground'
                        )}
                      >
                        {currentPage === item.value && (
                          <span className="absolute top-0 h-0.5 w-8 bg-primary rounded-b-full" />
                        )}
                        <div
                          className={cn(
                            'p-1 rounded-xl transition-all',
                            currentPage === item.value ? 'bg-primary/10' : ''
                          )}
                        >
                          {item.icon}
                        </div>
                        <span className="text-[10px] font-medium">{item.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                <Toaster />
              </div>
            </ThemeProvider>
          </LanguageProvider>
        </UiProvider>
      </DataProvider>
    </AuthProvider>
  );
}
