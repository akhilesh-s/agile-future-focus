import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, Lock } from 'lucide-react';
import { useAuth } from './AuthProvider';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard = ({ children }: AuthGuardProps) => {
  const { user, loading, signIn } = useAuth();

  useEffect(() => {
    // Auto sign in anonymously if no user
    if (!loading && !user) {
      signIn();
    }
  }, [loading, user, signIn]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Initializing...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        {/* Animated Background */}
        <div className="fixed inset-0 bg-gradient-cosmic opacity-5"></div>
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_80%,_hsl(270_91%_65%_/_0.1),_transparent_50%)]"></div>
        <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_20%,_hsl(180_100%_70%_/_0.1),_transparent_50%)]"></div>
        
        <div className="relative z-10 container mx-auto px-4 py-8 max-w-md flex items-center justify-center min-h-screen">
          <Card className="bg-card/50 border-border/20 shadow-glow w-full">
            <CardHeader className="text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-primary text-primary-foreground font-medium text-sm shadow-glow mb-4 mx-auto">
                <Sparkles className="h-4 w-4" />
                Access Required
              </div>
              <CardTitle className="text-2xl font-bold bg-gradient-cosmic bg-clip-text text-transparent">
                Initialize Session
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-center">
              <div className="flex justify-center">
                <Lock className="h-12 w-12 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground">
                Click below to initialize your session and start using the retrospective tool.
              </p>
              <Button
                onClick={signIn}
                className="w-full bg-gradient-accent hover:shadow-accent-glow"
              >
                <Sparkles className="h-4 w-4 mr-2" />
                Initialize Session
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}; 