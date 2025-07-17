import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";
import supabase from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface RetroItem {
  id: string;
  text: string;
  author?: string;
}

interface RetroSectionProps {
  title: string;
  icon: React.ReactNode;
  placeholder: string;
  prompts: string[];
  bgClass: string;
  glowClass: string;
  badgeClass: string;
  retroId?: number;
  sectionType?: string;
}

export function RetroSection({
  title,
  icon,
  placeholder,
  prompts,
  bgClass,
  glowClass,
  badgeClass,
  retroId,
  sectionType
}: RetroSectionProps) {
  const [items, setItems] = useState<RetroItem[]>([]);
  const [newItem, setNewItem] = useState("");
  const [sectionId, setSectionId] = useState<number | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (retroId && sectionType) {
      initializeSection();
    }
  }, [retroId, sectionType]);

  const initializeSection = async () => {
    try {
      // Get or create section
      let { data: section, error: sectionError } = await supabase
        .from('sections')
        .select('*')
        .eq('retro_id', retroId)
        .eq('name', sectionType)
        .single();

      if (sectionError && sectionError.code === 'PGRST116') {
        // Section doesn't exist, create it
        const { data: newSection, error: createError } = await supabase
          .from('sections')
          .insert([{ retro_id: retroId, name: sectionType }])
          .select()
          .single();

        if (createError) throw createError;
        section = newSection;
      } else if (sectionError) {
        throw sectionError;
      }

      setSectionId(section.id);

      // Load items for this section
      const { data: itemsData, error: itemsError } = await supabase
        .from('items')
        .select('*')
        .eq('section_id', section.id)
        .order('created_at', { ascending: true });

      if (itemsError) throw itemsError;

      setItems(itemsData.map(item => ({
        id: item.id.toString(),
        text: item.content || ''
      })));
    } catch (error) {
      console.error('Error initializing section:', error);
      toast({
        title: "Error",
        description: "Failed to load section data",
        variant: "destructive",
      });
    }
  };

  const addItem = async () => {
    if (newItem.trim() && sectionId) {
      try {
        const { data, error } = await supabase
          .from('items')
          .insert([{ section_id: sectionId, content: newItem.trim() }])
          .select()
          .single();

        if (error) throw error;

        setItems([...items, { id: data.id.toString(), text: data.content || '' }]);
        setNewItem("");
      } catch (error) {
        console.error('Error adding item:', error);
        toast({
          title: "Error",
          description: "Failed to add item",
          variant: "destructive",
        });
      }
    }
  };

  const removeItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from('items')
        .delete()
        .eq('id', parseInt(id));

      if (error) throw error;

      setItems(items.filter(item => item.id !== id));
    } catch (error) {
      console.error('Error removing item:', error);
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey) {
      addItem();
    }
  };

  return (
    <Card className={`${bgClass} border-border/20 backdrop-blur-sm hover:${glowClass} transition-all duration-300 group`}>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-3 text-xl font-bold text-foreground">
          <div className="p-2 rounded-lg bg-gradient-primary">
            {icon}
          </div>
          {title}
        </CardTitle>
        <div className="space-y-1">
          {prompts.map((prompt, index) => (
            <p key={index} className="text-sm text-muted-foreground italic">
              • {prompt}
            </p>
          ))}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        <div className="space-y-3">
          {items.map((item) => (
            <div
              key={item.id}
              className="group/item p-3 rounded-lg bg-muted/30 border border-border/10 hover:bg-muted/50 transition-all duration-200"
            >
              <div className="flex justify-between items-start gap-2">
                <p className="text-sm text-foreground flex-1">{item.text}</p>
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
        
        <div className="space-y-2">
          <Textarea
            placeholder={placeholder}
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={handleKeyPress}
            className="resize-none bg-background/50 border-border/20 focus:border-primary/50 transition-colors"
            rows={3}
          />
          <div className="flex justify-between items-center">
            <Badge variant="secondary" className={badgeClass}>
              {items.length} item{items.length !== 1 ? 's' : ''}
            </Badge>
            <Button 
              onClick={addItem}
              disabled={!newItem.trim()}
              className="bg-gradient-primary hover:shadow-glow transition-all duration-200"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Item
            </Button>
          </div>
          <p className="text-xs text-muted-foreground">
            Tip: Press Ctrl+Enter to quickly add an item
          </p>
        </div>
      </CardContent>
    </Card>
  );
}