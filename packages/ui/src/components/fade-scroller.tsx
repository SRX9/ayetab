"use client";

import {
  useCallback,
  useEffect,
  useRef,
  type CSSProperties,
  type ElementType,
  type HTMLAttributes,
  type ReactNode,
} from "react";
import { cn } from "../lib/utils";

/** How long the scrollbar lingers after the surface stops moving. */
const SCROLLBAR_LINGER_MS = 500;

/** Fractional scroll offsets never land exactly on the bounds. */
const EDGE_SLACK_PX = 1;

/** Stacked backdrop layers that make up one progressive-blur band. */
const BLUR_LAYERS = [0, 1, 2, 3];

interface FadeScrollerProps extends HTMLAttributes<HTMLElement> {
  children: ReactNode;
  /** Element for the frame — use a landmark (`nav`, `section`) when it is one. */
  as?: "div" | "nav" | "section" | "aside";
  /** Classes on the frame: sizing and placement (`flex-1`, `max-h-*`). */
  className?: string;
  /** Classes on the scrolling element inside it: padding and content spacing. */
  scrollerClassName?: string;
  /** Depth of each fade band. Any CSS length; defaults to `2.25rem`. */
  edgeHeight?: string;
}

/**
 * A scroll region with no permanent chrome: the scrollbar inks in while the
 * surface is moving and fades back out once it stops, and content dissolves
 * into the surface at whichever edge it runs past — progressively blurred
 * rather than cut on a hard line.
 */
export function FadeScroller({
  as = "div",
  className,
  scrollerClassName,
  edgeHeight,
  children,
  ...rest
}: FadeScrollerProps) {
  const Frame = as as ElementType;
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const topEdgeRef = useRef<HTMLDivElement | null>(null);
  const bottomEdgeRef = useRef<HTMLDivElement | null>(null);

  /*
   * Edge and scrollbar state live in DOM attributes rather than React state:
   * this runs on every scroll frame, and a 40-row list has no business
   * re-rendering to draw a gradient.
   */
  const syncEdges = useCallback(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    const overflows = max > EDGE_SLACK_PX;
    if (topEdgeRef.current) {
      topEdgeRef.current.dataset.visible = String(overflows && el.scrollTop > EDGE_SLACK_PX);
    }
    if (bottomEdgeRef.current) {
      bottomEdgeRef.current.dataset.visible = String(
        overflows && el.scrollTop < max - EDGE_SLACK_PX
      );
    }
  }, []);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;

    let hideTimer = 0;
    const onScroll = () => {
      el.dataset.scrolling = "true";
      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => {
        el.dataset.scrolling = "false";
      }, SCROLLBAR_LINGER_MS);
      syncEdges();
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    syncEdges();

    /*
     * Both ends of the bounds move on their own: the viewport when the pane
     * resizes, the content when a search filters the list.
     */
    const observer =
      typeof ResizeObserver === "undefined" ? null : new ResizeObserver(syncEdges);
    observer?.observe(el);
    if (contentRef.current) observer?.observe(contentRef.current);

    return () => {
      window.clearTimeout(hideTimer);
      el.removeEventListener("scroll", onScroll);
      observer?.disconnect();
    };
  }, [syncEdges]);

  return (
    <Frame
      className={cn("fade-scroller-frame", className)}
      style={
        edgeHeight ? ({ "--fade-scroller-edge-height": edgeHeight } as CSSProperties) : undefined
      }
      {...rest}
    >
      <div ref={scrollerRef} data-scrolling="false" className={cn("fade-scroller", scrollerClassName)}>
        <div ref={contentRef}>{children}</div>
      </div>

      <div ref={topEdgeRef} className="fade-scroller-edge" data-side="top" data-visible="false" aria-hidden>
        {BLUR_LAYERS.map((layer) => (
          <span key={layer} />
        ))}
      </div>
      <div
        ref={bottomEdgeRef}
        className="fade-scroller-edge"
        data-side="bottom"
        data-visible="false"
        aria-hidden
      >
        {BLUR_LAYERS.map((layer) => (
          <span key={layer} />
        ))}
      </div>
    </Frame>
  );
}
