import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Plus, 
  Sparkles, 
  Calendar, 
  Users,
  TrendingUp,
  Clock
} from "lucide-react";
import supabase from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const Home = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [retros, setRetros] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRetros();
  }, []);

  const fetchRetros = async () => {
    try {
      const { data, error } = await supabase
        .from('retro')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setRetros(data || []);
    } catch (error) {
      console.error('Error fetching retros:', error);
      toast({
        title: "Error",
        description: "Failed to load retrospectives",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-cosmic opacity-5"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_80%,_hsl(270_91%_65%_/_0.1),_transparent_50%)]"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_20%,_hsl(180_100%_70%_/_0.1),_transparent_50%)]"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        {/* Header */}
        <div className="text-center mb-12 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-primary text-primary-foreground font-medium text-sm shadow-glow">
            <Sparkles className="h-4 w-4" />
            Agile Retrospective Tool
          </div>
          
          <h1 className="text-5xl font-bold bg-gradient-cosmic bg-clip-text text-transparent">
            Team Retrospectives
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Create and manage retrospective sessions to help your team reflect, 
            learn, and improve together.
          </p>
          
          <Button 
            onClick={() => navigate('/create')}
            className="bg-gradient-accent hover:shadow-accent-glow"
          >
            <Plus className="h-4 w-4 mr-2" />
            Create New Retrospective
          </Button>
        </div>

        {/* Recent Retrospectives */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h2 className="text-2xl font-semibold">Recent Retrospectives</h2>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, i) => (
                <Card key={i} className="bg-card/50 border-border/20">
                  <CardHeader>
                    <div className="h-6 bg-muted/50 rounded animate-pulse"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-4 bg-muted/50 rounded animate-pulse"></div>
                      <div className="h-4 bg-muted/50 rounded animate-pulse w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : retros.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {retros.map((retro) => (
                <Card 
                  key={retro.id} 
                  className="bg-card/50 border-border/20 hover:shadow-glow transition-all duration-300 cursor-pointer group"
                  onClick={() => navigate(`/retro/${retro.id}`)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <CardTitle className="text-lg font-semibold group-hover:text-primary transition-colors">
                        {retro.name}
                      </CardTitle>
                      <Badge className="bg-success/20 text-success border-success/20">
                        Active
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        Created {formatDate(retro.created_at)}
                      </div>
                      
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        Team Retrospective
                      </div>

                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="h-4 w-4" />
                        Ready for session
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <Card className="bg-card/50 border-border/20 text-center py-12">
              <CardContent>
                <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-xl font-semibold mb-2">No Retrospectives Yet</h3>
                <p className="text-muted-foreground mb-6">
                  Create your first retrospective to get started with team reflection and improvement.
                </p>
                <Button 
                  onClick={() => navigate('/create')}
                  className="bg-gradient-accent hover:shadow-accent-glow"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Retrospective
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-muted/20 text-muted-foreground text-sm">
            <Sparkles className="h-3 w-3" />
            Built for continuous team improvement
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;