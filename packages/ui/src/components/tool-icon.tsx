"use client";

import { HugeiconsIcon, type IconSvgElement } from "@hugeicons/react";
import {
  ArrowDataTransferHorizontalIcon,
  BinaryIcon,
  BracesIcon,
  BracketsIcon,
  Calculator01Icon,
  CalendarCheckIn01Icon,
  CaseSensitiveIcon,
  CheckListIcon,
  Clock01Icon,
  CodeIcon,
  ColorsIcon,
  ComponentIcon,
  ComputerIcon,
  ComputerTerminal01Icon,
  Database01Icon,
  DivideSignIcon,
  DocumentCodeIcon,
  FileCodeIcon,
  FileDiffIcon,
  FileEmpty02Icon,
  FingerPrintIcon,
  GitCompareIcon,
  Globe02Icon,
  HashIcon,
  HexagonIcon,
  Image01Icon,
  ImageAdd01Icon,
  LayoutGridIcon,
  LayoutThreeColumnIcon,
  LeftToRightListNumberIcon,
  Link01Icon,
  Link02Icon,
  LockIcon,
  PaintBoardIcon,
  PaintBrush04Icon,
  PenTool01Icon,
  PhpIcon,
  QrCodeIcon,
  RegexIcon,
  Search01Icon,
  SearchVisualIcon,
  SecurityCheckIcon,
  Shield01Icon,
  ShuffleIcon,
  SourceCodeIcon,
  SparklesIcon,
  SqlIcon,
  StarIcon,
  StickyNote01Icon,
  StopWatchIcon,
  Table01Icon,
  TextIcon,
  Timer01Icon,
  Wrench01Icon,
  Xml01Icon,
} from "@hugeicons/core-free-icons";
import { cn } from "../lib/utils";

const ICONS: Record<string, IconSvgElement> = {
  ArrowLeftRight: ArrowDataTransferHorizontalIcon,
  Binary: BinaryIcon,
  Braces: BracesIcon,
  Brackets: BracketsIcon,
  Calculator: Calculator01Icon,
  CalendarCheck: CalendarCheckIn01Icon,
  CaseSensitive: CaseSensitiveIcon,
  Clock: Clock01Icon,
  Code: CodeIcon,
  Code2: SourceCodeIcon,
  Columns: LayoutThreeColumnIcon,
  Columns3: LayoutThreeColumnIcon,
  Component: ComponentIcon,
  Database: Database01Icon,
  FileCode: FileCodeIcon,
  FileCode2: DocumentCodeIcon,
  FileDiff: FileDiffIcon,
  FileJson: Xml01Icon,
  FileJson2: Xml01Icon,
  FileText: FileEmpty02Icon,
  Fingerprint: FingerPrintIcon,
  GitCompare: GitCompareIcon,
  Globe: Globe02Icon,
  Hash: HashIcon,
  Hexagon: HexagonIcon,
  Image: Image01Icon,
  ImagePlus: ImageAdd01Icon,
  LayoutGrid: LayoutGridIcon,
  Link: Link01Icon,
  Link2: Link02Icon,
  ListOrdered: LeftToRightListNumberIcon,
  ListTodo: CheckListIcon,
  Lock: LockIcon,
  Monitor: ComputerIcon,
  PaintBoard: PaintBoardIcon,
  Paintbrush: PaintBrush04Icon,
  Palette: ColorsIcon,
  PenTool: PenTool01Icon,
  PHP: PhpIcon,
  QrCode: QrCodeIcon,
  Regex: RegexIcon,
  ScanSearch: SearchVisualIcon,
  Search: Search01Icon,
  Shield: Shield01Icon,
  ShieldCheck: SecurityCheckIcon,
  Shuffle: ShuffleIcon,
  Slash: DivideSignIcon,
  Sparkles: SparklesIcon,
  Sql: SqlIcon,
  Star: StarIcon,
  StickyNote: StickyNote01Icon,
  Stopwatch: StopWatchIcon,
  Table: Table01Icon,
  Terminal: ComputerTerminal01Icon,
  Text: TextIcon,
  Timer: Timer01Icon,
  Wrench: Wrench01Icon,
};

interface ToolIconProps {
  name: string;
  className?: string;
  size?: number | string;
  strokeWidth?: number;
}

export function ToolIcon({ name, className, size = "1em", strokeWidth = 1.75 }: ToolIconProps) {
  const icon = ICONS[name] ?? Wrench01Icon;
  return (
    <HugeiconsIcon
      icon={icon}
      size={size}
      strokeWidth={strokeWidth}
      color="currentColor"
      aria-hidden
      className={cn("shrink-0 text-current", className)}
    />
  );
}
