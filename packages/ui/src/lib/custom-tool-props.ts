export interface CustomToolProps {
  tool: import("@ayetab/utils").ToolDefinition;
  onRecent?: (toolId: string) => void;
  isFavorite?: boolean;
  onToggleFavorite?: () => void;
  compact?: boolean;
}
