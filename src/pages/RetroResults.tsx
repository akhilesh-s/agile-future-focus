import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  ArrowLeft, 
  Calendar, 
  Clock, 
  TrendingUp, 
  AlertTriangle, 
  Heart, 
  CheckSquare,
  Users,
  Download,
  Share,
  ThumbsUp
} from "lucide-react";
import supabase from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RetroData {
  id: number;
  name: string;
  created_at: string;
  sections: Array<{
    id: number;
    name: string;
    items: Array<{
      id: number;
      content: string;
      created_at: string;
      upvotes?: number;
    }>;
    action_items?: Array<{
      id: number;
      description: string;
      assigned_owner: string;
      priority: string;
      created_at: string;
    }>;
  }>;
}

const RetroResults = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [retroData, setRetroData] = useState<RetroData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetchRetroResults();
    }
  }, [id]);

  const fetchRetroResults = async () => {
    try {
      // Fetch retro basic info
      const { data: retro, error: retroError } = await supabase
        .from('retro')
        .select('*')
        .eq('id', parseInt(id!))
        .single();

      if (retroError) throw retroError;

      // Fetch sections
      const { data: sections, error: sectionsError } = await supabase
        .from('sections')
        .select('*')
        .eq('retro_id', parseInt(id!));

      if (sectionsError) throw sectionsError;

      // Fetch items for each section
      const sectionsWithData = await Promise.all(
        sections.map(async (section) => {
          if (section.name === 'action_items') {
            // Fetch action items
            const { data: actionItems, error: actionItemsError } = await supabase
              .from('action_items')
              .select('*')
              .eq('section_id', section.id)
              .order('created_at', { ascending: true });

            if (actionItemsError) throw actionItemsError;

            return {
              ...section,
              items: [],
              action_items: actionItems || []
            };
          } else {
            // Fetch regular items with upvote counts
            const { data: items, error: itemsError } = await supabase
              .from('items')
              .select('*')
              .eq('section_id', section.id)
              .order('created_at', { ascending: true });

            if (itemsError) throw itemsError;

            // Get upvote counts for each item
            const itemsWithUpvotes = await Promise.all(
              (items || []).map(async (item) => {
                const { data: upvoteData, error: upvoteError } = await supabase
                  .from('upvotes')
                  .select('*')
                  .eq('item_id', item.id);

                return {
                  ...item,
                  upvotes: upvoteData?.length || 0
                };
              })
            );

            return {
              ...section,
              items: itemsWithUpvotes
            };
          }
        })
      );

      setRetroData({
        ...retro,
        sections: sectionsWithData
      });
    } catch (error) {
      console.error('Error fetching retro results:', error);
      toast({
        title: "Error",
        description: "Failed to load retrospective results",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getSectionIcon = (sectionName: string) => {
    switch (sectionName) {
      case 'what_went_well':
        return <TrendingUp className="h-5 w-5 text-green-500" />;
      case 'what_could_be_improved':
        return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
      case 'action_items':
        return <CheckSquare className="h-5 w-5 text-blue-500" />;
      default:
        return <Heart className="h-5 w-5 text-purple-500" />;
    }
  };

  const getSectionTitle = (sectionName: string) => {
    switch (sectionName) {
      case 'what_went_well':
        return 'What Went Well';
      case 'what_could_be_improved':
        return 'What Could Be Improved';
      case 'action_items':
        return 'Action Items';
      default:
        return sectionName.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority?.toLowerCase()) {
      case 'high':
        return 'bg-red-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-black';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const exportResults = () => {
    if (!retroData) return;

    const exportData = {
      retrospective: retroData.name,
      date: formatDate(retroData.created_at),
      sections: retroData.sections.map(section => ({
        name: getSectionTitle(section.name),
        items: section.name === 'action_items' 
          ? section.action_items?.map(item => ({
              description: item.description,
              owner: item.assigned_owner,
              priority: item.priority,
              date: formatDate(item.created_at)
            }))
          : section.items.map(item => ({
              content: item.content,
              date: formatDate(item.created_at)
            }))
      }))
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `retro-results-${retroData.name.replace(/\s+/g, '-').toLowerCase()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Success",
      description: "Results exported successfully!",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Loading results...</p>
        </div>
      </div>
    );
  }

  if (!retroData) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Retrospective Not Found</h2>
          <Button onClick={() => navigate('/')}>Go Home</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Animated Background */}
      <div className="fixed inset-0 bg-gradient-cosmic opacity-5"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_20%_80%,_hsl(270_91%_65%_/_0.1),_transparent_50%)]"></div>
      <div className="fixed inset-0 bg-[radial-gradient(circle_at_80%_20%,_hsl(180_100%_70%_/_0.1),_transparent_50%)]"></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            variant="outline"
            onClick={() => navigate(`/retro/${id}`)}
            className="border-border/20 hover:bg-muted/50"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Retro
          </Button>
          
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={exportResults}
              className="border-border/20 hover:bg-muted/50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button
              variant="outline"
              onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                toast({
                  title: "Success",
                  description: "Results link copied to clipboard!",
                });
              }}
              className="border-border/20 hover:bg-muted/50"
            >
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Title Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold bg-gradient-cosmic bg-clip-text text-transparent mb-4">
            {retroData.name} - Results
          </h1>
          
          <div className="flex items-center justify-center gap-6 text-muted-foreground">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span>{formatDate(retroData.created_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>{retroData.sections.reduce((total, section) => 
                total + (section.items?.length || 0) + (section.action_items?.length || 0), 0
              )} Total Items</span>
            </div>
          </div>
        </div>

        {/* Results Grid */}
        <div className="space-y-8">
          {retroData.sections.map((section) => (
            <Card key={section.id} className="bg-card/50 border-border/20 shadow-glow">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  {getSectionIcon(section.name)}
                  {getSectionTitle(section.name)}
                  <Badge variant="secondary" className="ml-auto">
                    {section.name === 'action_items' 
                      ? section.action_items?.length || 0
                      : section.items?.length || 0
                    } items
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {section.name === 'action_items' ? (
                  // Action Items Section
                  <div className="space-y-4">
                    {section.action_items && section.action_items.length > 0 ? (
                      section.action_items.map((item, index) => (
                        <div key={item.id} className="p-4 rounded-lg bg-muted/20 border border-border/10">
                          <div className="flex items-start justify-between gap-4">
                            <div className="flex-1">
                              <p className="font-medium mb-2">{item.description}</p>
                              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                                <div className="flex items-center gap-2">
                                  <Users className="h-3 w-3" />
                                  <span>{item.assigned_owner}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <Clock className="h-3 w-3" />
                                  <span>{formatDate(item.created_at)}</span>
                                </div>
                              </div>
                            </div>
                            <Badge className={getPriorityColor(item.priority)}>
                              {item.priority}
                            </Badge>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground italic text-center py-8">
                        No action items recorded
                      </p>
                    )}
                  </div>
                ) : (
                  // Regular Items Section
                  <div className="space-y-3">
                    {section.items && section.items.length > 0 ? (
                      section.items.map((item, index) => (
                        <div key={item.id} className="p-4 rounded-lg bg-muted/20 border border-border/10">
                          <div className="flex items-start justify-between gap-3 mb-2">
                            <p className="flex-1">{item.content}</p>
                            {item.upvotes !== undefined && (
                              <div className="flex items-center gap-1 text-sm text-muted-foreground bg-muted/30 px-2 py-1 rounded">
                                <ThumbsUp className="h-3 w-3" />
                                <span>{item.upvotes}</span>
                              </div>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{formatDate(item.created_at)}</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground italic text-center py-8">
                        No items recorded in this section
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Summary Stats */}
        <Card className="mt-12 bg-card/50 border-border/20 shadow-glow">
          <CardHeader>
            <CardTitle className="text-xl">Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {retroData.sections.map((section) => {
                const itemCount = section.name === 'action_items' 
                  ? section.action_items?.length || 0
                  : section.items?.length || 0;
                
                return (
                  <div key={section.id} className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      {getSectionIcon(section.name)}
                    </div>
                    <div className="text-2xl font-bold text-primary">{itemCount}</div>
                    <div className="text-sm text-muted-foreground">
                      {getSectionTitle(section.name)}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RetroResults; 