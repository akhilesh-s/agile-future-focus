import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { CheckSquare, Plus, X, User, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ActionItem {
  id: string;
  description: string;
  owner: string;
  priority: 'High' | 'Medium' | 'Low';
  dueDate?: string;
}

interface ActionItemsSectionProps {
  retroId?: number;
}

export function ActionItemsSection({ retroId }: ActionItemsSectionProps) {
  const [items, setItems] = useState<ActionItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [sectionId, setSectionId] = useState<number | null>(null);
  const [newItem, setNewItem] = useState({
    description: "",
    owner: "",
    priority: "Medium" as const,
    dueDate: ""
  });
  const { toast } = useToast();

  useEffect(() => {
    if (retroId) {
      initializeActionItemsSection();
    }
  }, [retroId]);

  const initializeActionItemsSection = async () => {
    try {
      // Get or create action items section
      let { data: section, error: sectionError } = await supabase
        .from('sections')
        .select('*')
        .eq('retro_id', retroId)
        .eq('name', 'action_items')
        .single();

      if (sectionError && sectionError.code === 'PGRST116') {
        // Section doesn't exist, create it
        const { data: newSection, error: createError } = await supabase
          .from('sections')
          .insert([{ retro_id: retroId, name: 'action_items' }])
          .select()
          .single();

        if (createError) throw createError;
        section = newSection;
      } else if (sectionError) {
        throw sectionError;
      }

      setSectionId(section.id);

      // Load action items for this section
      const { data: actionItems, error: itemsError } = await supabase
        .from('action_items')
        .select('*')
        .eq('section_id', section.id)
        .order('created_at', { ascending: true });

      if (itemsError) throw itemsError;

      setItems(actionItems.map(item => ({
        id: item.id.toString(),
        description: item.description || '',
        owner: item.assigned_owner || '',
        priority: (item.priority as any) || 'Medium'
      })));
    } catch (error) {
      console.error('Error initializing action items section:', error);
      toast({
        title: "Error",
        description: "Failed to load action items",
        variant: "destructive",
      });
    }
  };

  const addItem = async () => {
    if (newItem.description.trim() && newItem.owner.trim() && sectionId) {
      try {
        const { data, error } = await supabase
          .from('action_items')
          .insert([{
            section_id: sectionId,
            description: newItem.description.trim(),
            assigned_owner: newItem.owner.trim(),
            priority: newItem.priority
          }])
          .select()
          .single();

        if (error) throw error;

        setItems([...items, {
          id: data.id.toString(),
          description: data.description || '',
          owner: data.assigned_owner || '',
          priority: (data.priority as any) || 'Medium'
        }]);
        setNewItem({ description: "", owner: "", priority: "Medium", dueDate: "" });
        setIsAdding(false);
      } catch (error) {
        console.error('Error adding action item:', error);
        toast({
          title: "Error",
          description: "Failed to add action item",
          variant: "destructive",
        });
      }
    }
  };

  const removeItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('action_items')
        .delete()
        .eq('id', parseInt(id));

      if (error) throw error;

      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error removing action item:', error);
      toast({
        title: "Error",
        description: "Failed to remove action item",
        variant: "destructive",
      });
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'High': return 'bg-destructive text-destructive-foreground';
      case 'Medium': return 'bg-warning text-warning-foreground';
      case 'Low': return 'bg-success text-success-foreground';
      default: return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <Card className="bg-card/50 border-border/20 backdrop-blur-sm hover:shadow-glow transition-all duration-300">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl font-bold text-foreground">
          <div className="p-2 rounded-lg bg-gradient-accent">
            <CheckSquare className="h-5 w-5 text-accent-foreground" />
          </div>
          Action Items
        </CardTitle>
        <div className="space-y-1">
          <p className="text-sm text-muted-foreground italic">
            • What specific steps will we take?
          </p>
          <p className="text-sm text-muted-foreground italic">
            • Who is responsible for each action?
          </p>
          <p className="text-sm text-muted-foreground italic">
            • When should this be completed?
          </p>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="group/item p-4 rounded-lg bg-muted/30 border border-border/10 hover:bg-muted/50 transition-all duration-200"
            >
              <div className="flex justify-between items-start gap-3">
                <div className="flex-1 space-y-2">
                  <p className="text-sm text-foreground font-medium">{item.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="text-xs">
                      <User className="h-3 w-3 mr-1" />
                      {item.owner}
                    </Badge>
                    <Badge className={`text-xs ${getPriorityColor(item.priority)}`}>
                      {item.priority} Priority
                    </Badge>
                    {item.dueDate && (
                      <Badge variant="outline" className="text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {item.dueDate}
                      </Badge>
                    )}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(item.id)}
                  className="opacity-0 group-hover/item:opacity-100 transition-opacity h-6 w-6 p-0 hover:bg-destructive/20 hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
        
        {isAdding ? (
          <div className="space-y-3 p-4 rounded-lg bg-muted/20 border border-border/20">
            <Textarea
              placeholder="Describe the action item (be specific and measurable)..."
              value={newItem.description}
              onChange={(e) => setNewItem({...newItem, description: e.target.value})}
              className="resize-none bg-background/50 border-border/20"
              rows={2}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <Input
                placeholder="Assigned to..."
                value={newItem.owner}
                onChange={(e) => setNewItem({...newItem, owner: e.target.value})}
                className="bg-background/50 border-border/20"
              />
              
              <Select value={newItem.priority} onValueChange={(value: any) => setNewItem({...newItem, priority: value})}>
                <SelectTrigger className="bg-background/50 border-border/20">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="High">High Priority</SelectItem>
                  <SelectItem value="Medium">Medium Priority</SelectItem>
                  <SelectItem value="Low">Low Priority</SelectItem>
                </SelectContent>
              </Select>
              
              <Input
                type="date"
                value={newItem.dueDate}
                onChange={(e) => setNewItem({...newItem, dueDate: e.target.value})}
                className="bg-background/50 border-border/20"
              />
            </div>
            
            <div className="flex gap-2">
              <Button 
                onClick={addItem}
                disabled={!newItem.description.trim() || !newItem.owner.trim()}
                className="bg-gradient-accent hover:shadow-accent-glow"
              >
                Add Action Item
              </Button>
              <Button 
                variant="outline" 
                onClick={() => {
                  setIsAdding(false);
                  setNewItem({ description: "", owner: "", priority: "Medium", dueDate: "" });
                }}
              >
                Cancel
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex justify-between items-center">
            <Badge variant="secondary" className="bg-accent/20 text-accent">
              {items.length} action{items.length !== 1 ? 's' : ''}
            </Badge>
            <Button 
              onClick={() => setIsAdding(true)}
              className="bg-gradient-accent hover:shadow-accent-glow transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Action Item
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}