import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sparkles, ArrowLeft } from "lucide-react";
import supabase from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

const CreateRetro = () => {
  const [retroName, setRetroName] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCreateRetro = async () => {
    if (!retroName.trim()) {
      toast({
        title: "Error",
        description: "Please enter a retro name",
        variant: "destructive",
      });
      return;
    }

    setIsCreating(true);
    try {
      const { data, error } = await supabase
        .from('retro')
        .insert([{ name: retroName.trim() }])
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Retro created successfully!",
      });

      navigate(`/retro/${data.id}`);
    } catch (error) {
      console.error('Error creating retro:', error);
      toast({
        title: "Error",
        description: "Failed to create retro",
        variant: "destructive",
      });
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-cosmic opacity-5"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_80%,_hsl(270_91%_65%_/_0.1),_transparent_50%)]"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_20%,_hsl(180_100%_70%_/_0.1),_transparent_50%)]"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-2xl">
        <Button
          variant="outline"
          onClick={() => navigate('/')}
          className="mb-8 border-border/20 hover:bg-muted/50"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Home
        </Button>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-primary text-primary-foreground font-medium text-sm shadow-glow mb-4">
            <Sparkles className="h-4 w-4" />
            Create New Retrospective
          </div>
          
          <h1 className="text-4xl font-bold bg-gradient-cosmic bg-clip-text text-transparent mb-4">
            Start Your Team Retrospective
          </h1>
          
          <p className="text-lg text-muted-foreground">
            Create a new retrospective session for your team to reflect and improve.
          </p>
        </div>

        <Card className="bg-card/50 border-border/20 shadow-glow">
          <CardHeader>
            <CardTitle className="text-xl font-semibold">Retrospective Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label htmlFor="retroName" className="block text-sm font-medium mb-2">
                Retrospective Name
              </label>
              <Input
                id="retroName"
                placeholder="Sprint 23 Retrospective, Q1 Team Review, etc."
                value={retroName}
                onChange={(e) => setRetroName(e.target.value)}
                className="bg-background/50 border-border/20"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleCreateRetro();
                  }
                }}
              />
            </div>

            <Button
              onClick={handleCreateRetro}
              disabled={isCreating}
              className="w-full bg-gradient-accent hover:shadow-accent-glow"
            >
              {isCreating ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  Create Retrospective
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default CreateRetro;