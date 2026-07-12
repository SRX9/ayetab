"use client";

import type { LucideIcon, LucideProps } from "lucide-react";
import {
  ArrowLeftRight,
  Binary,
  Braces,
  Brackets,
  Calculator,
  CalendarCheck,
  CaseSensitive,
  Clock,
  Code,
  Code2,
  Columns3,
  Component,
  Database,
  FileCode,
  FileCode2,
  FileJson,
  FileJson2,
  FileText,
  Fingerprint,
  GitCompare,
  Globe,
  Hash,
  Hexagon,
  Image,
  ImagePlus,
  LayoutGrid,
  Link,
  Link2,
  ListOrdered,
  ListTodo,
  Lock,
  Monitor,
  Paintbrush,
  Palette,
  PenTool,
  QrCode,
  Regex,
  ScanSearch,
  Search,
  Shield,
  ShieldCheck,
  Shuffle,
  Slash,
  Sparkles,
  Star,
  StickyNote,
  Table,
  Terminal,
  Text,
  Timer,
  Wrench,
} from "lucide-react";
import { cn } from "../lib/utils";

const ICONS: Record<string, LucideIcon> = {
  ArrowLeftRight,
  Binary,
  Braces,
  Brackets,
  Calculator,
  CalendarCheck,
  CaseSensitive,
  Clock,
  Code,
  Code2,
  Columns: Columns3,
  Columns3,
  Component,
  Database,
  FileCode,
  FileCode2,
  FileJson,
  FileJson2,
  FileText,
  Fingerprint,
  GitCompare,
  Globe,
  Hash,
  Hexagon,
  Image,
  ImagePlus,
  LayoutGrid,
  Link,
  Link2,
  ListOrdered,
  ListTodo,
  Lock,
  Monitor,
  Paintbrush,
  Palette,
  PenTool,
  PHP: FileCode,
  QrCode,
  Regex,
  ScanSearch,
  Search,
  Shield,
  ShieldCheck,
  Shuffle,
  Slash,
  Sparkles,
  Star,
  StickyNote,
  Stopwatch: Timer,
  Table,
  Terminal,
  Text,
  Timer,
  Wrench,
};

interface ToolIconProps extends Omit<LucideProps, "ref"> {
  name: string;
  className?: string;
}

export function ToolIcon({ name, className, strokeWidth = 1.75, ...props }: ToolIconProps) {
  const Icon = ICONS[name] ?? Wrench;
  return (
    <Icon
      aria-hidden
      strokeWidth={strokeWidth}
      className={cn("shrink-0 text-current", className)}
      {...props}
    />
  );
}
