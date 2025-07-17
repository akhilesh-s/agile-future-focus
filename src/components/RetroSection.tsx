import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, X } from "lucide-react";

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
}

export function RetroSection({
  title,
  icon,
  placeholder,
  prompts,
  bgClass,
  glowClass,
  badgeClass
}: RetroSectionProps) {
  const [items, setItems] = useState<RetroItem[]>([]);
  const [newItem, setNewItem] = useState("");

  const addItem = () => {
    if (newItem.trim()) {
      setItems([...items, { id: Date.now().toString(), text: newItem.trim() }]);
      setNewItem("");
    }
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
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