import { RetroSection } from "./RetroSection";
import { ActionItemsSection } from "./ActionItemsSection";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  TrendingUp, 
  AlertTriangle, 
  Heart, 
  Users, 
  Download, 
  Share2,
  Sparkles,
  Calendar,
  Clock
} from "lucide-react";

export function RetrospectiveTool() {
  const currentDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  const handleExport = () => {
    // Future implementation for exporting retrospective data
    console.log("Exporting retrospective data...");
  };

  const handleShare = () => {
    // Future implementation for sharing retrospective
    console.log("Sharing retrospective...");
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
            Team Retrospective
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
          
          <div className="flex justify-center gap-3">
            <Button 
              onClick={handleExport}
              variant="outline" 
              className="border-border/20 hover:bg-muted/50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Results
            </Button>
            <Button 
              onClick={handleShare}
              className="bg-gradient-accent hover:shadow-accent-glow"
            >
              <Share2 className="h-4 w-4 mr-2" />
              Share with Team
            </Button>
          </div>
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
          />
        </div>

        {/* Full-width sections */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Action Items */}
          <ActionItemsSection />

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
}