import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Calendar, Clock } from "lucide-react";
import supabase from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { RetroSection } from "@/components/RetroSection";
import { ActionItemsSection } from "@/components/ActionItemsSection";
import { 
  TrendingUp, 
  AlertTriangle, 
  Heart, 
  Users
} from "lucide-react";

const RetroDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [retro, setRetro] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchRetro();
    }
  }, [id]);

  const fetchRetro = async () => {
    try {
      const { data, error } = await supabase
        .from('retro')
        .select('*')
        .eq('id', parseInt(id))
        .single();

      if (error) throw error;
      setRetro(data);
    } catch (error) {
      console.error('Error fetching retro:', error);
      toast({
        title: "Error",
        description: "Failed to load retrospective",
        variant: "destructive",
      });
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!retro) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Retrospective Not Found</h2>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-cosmic opacity-5"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_80%,_hsl(270_91%_65%_/_0.1),_transparent_50%)]"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_20%,_hsl(180_100%_70%_/_0.1),_transparent_50%)]"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="mb-8 border-border/20 hover:bg-muted/50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        {/* Header */}
        <div className="text-center mb-12 space-y-6">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-primary text-primary-foreground font-medium text-sm shadow-glow">
            <Sparkles className="h-4 w-4" />
            Live Retrospective Session
          </div>
          
          <h1 className="text-5xl font-bold bg-gradient-cosmic bg-clip-text text-transparent">
            {retro.name}
          </h1>
          
          <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              {currentDate}
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              Live Session
            </div>
          </div>

          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Reflect, learn, and improve together. Use this structured template to facilitate 
            meaningful team discussions and drive continuous improvement.
          </p>
          
          <Button
            onClick={() => navigate(`/retro/${id}/results`)}
            variant="outline"
            className="border-border/20 hover:bg-muted/50 mt-4"
          >
            View Results Summary
          </Button>
        </div>

        {/* Retrospective Sections Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
          {/* What Went Well */}
          <RetroSection
            title="What Went Well"
            icon={<TrendingUp className="h-5 w-5 text-primary-foreground" />}
            placeholder="Share something positive from this sprint..."
            prompts={[
              "What should we continue doing?",
              "What exceeded expectations?",
              "Which processes worked smoothly?"
            ]}
            bgClass="bg-card/50"
            glowClass="shadow-success-glow"
            badgeClass="bg-success/20 text-success"
            retroId={parseInt(id)}
            sectionType="went_well"
          />

          {/* What Can Be Improved */}
          <RetroSection
            title="What Can Be Improved"
            icon={<AlertTriangle className="h-5 w-5 text-primary-foreground" />}
            placeholder="Identify areas for improvement..."
            prompts={[
              "What slowed us down?",
              "What would we do differently?",
              "Which processes need refinement?"
            ]}
            bgClass="bg-card/50"
            glowClass="shadow-glow"
            badgeClass="bg-warning/20 text-warning"
            retroId={parseInt(id)}
            sectionType="improve"
          />

          {/* Kudos */}
          <RetroSection
            title="Kudos & Recognition"
            icon={<Heart className="h-5 w-5 text-primary-foreground" />}
            placeholder="Recognize a teammate's contribution..."
            prompts={[
              "Who went above and beyond?",
              "What achievements should we celebrate?",
              "Which collaboration was exceptional?"
            ]}
            bgClass="bg-card/50"
            glowClass="shadow-accent-glow"
            badgeClass="bg-accent/20 text-accent"
            retroId={parseInt(id)}
            sectionType="kudos"
          />
        </div>

        {/* Full-width sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Action Items */}
          <ActionItemsSection retroId={parseInt(id)} />

          {/* Discussion with Product/Design */}
          <RetroSection
            title="Product & Design Discussion"
            icon={<Users className="h-5 w-5 text-primary-foreground" />}
            placeholder="Share feedback for product and design teams..."
            prompts={[
              "How can we improve requirements clarity?",
              "What design decisions need discussion?",
              "How can we enhance cross-team collaboration?"
            ]}
            bgClass="bg-card/50"
            glowClass="shadow-glow"
            badgeClass="bg-primary/20 text-primary"
            retroId={parseInt(id)}
            sectionType="product_design"
          />
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

export default RetroDetails;