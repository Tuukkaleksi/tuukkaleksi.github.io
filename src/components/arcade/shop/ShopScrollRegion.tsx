"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ThumbState = {
  top: number;
  height: number;
  visible: boolean;
};

type ShopScrollRegionProps = {
  children: React.ReactNode;
  className?: string;
};

export function ShopScrollRegion({ children, className = "" }: ShopScrollRegionProps) {
  const viewportRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({ active: false, startY: 0, startScroll: 0 });
  const [thumb, setThumb] = useState<ThumbState>({ top: 0, height: 48, visible: false });

  const updateThumb = useCallback(() => {
    const el = viewportRef.current;
    if (!el) return;
    const { scrollTop, scrollHeight, clientHeight } = el;
    if (scrollHeight <= clientHeight + 1) {
      setThumb((prev) => (prev.visible ? { ...prev, visible: false } : prev));
      return;
    }
    const ratio = clientHeight / scrollHeight;
    const height = Math.max(40, Math.floor(clientHeight * ratio));
    const maxTop = clientHeight - height;
    const top =
      scrollHeight === clientHeight
        ? 0
        : (scrollTop / (scrollHeight - clientHeight)) * maxTop;
    setThumb({ top, height, visible: true });
  }, []);

  useEffect(() => {
    const el = viewportRef.current;
    if (!el) return;
    updateThumb();
    el.addEventListener("scroll", updateThumb, { passive: true });
    const ro = new ResizeObserver(updateThumb);
    ro.observe(el);
    if (el.firstElementChild) ro.observe(el.firstElementChild);
    return () => {
      el.removeEventListener("scroll", updateThumb);
      ro.disconnect();
    };
  }, [updateThumb]);

  const scrollByThumb = useCallback((clientY: number, trackEl: HTMLElement) => {
    const viewport = viewportRef.current;
    if (!viewport) return;
    const rect = trackEl.getBoundingClientRect();
    const trackH = rect.height;
    const ratio = (clientY - rect.top) / trackH;
    const maxScroll = viewport.scrollHeight - viewport.clientHeight;
    viewport.scrollTop = ratio * maxScroll;
  }, []);

  const onTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget) return;
    scrollByThumb(e.clientY, e.currentTarget);
  };

  const onThumbPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.preventDefault();
    const viewport = viewportRef.current;
    if (!viewport) return;
    dragRef.current = { active: true, startY: e.clientY, startScroll: viewport.scrollTop };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onThumbPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!dragRef.current.active) return;
    const viewport = viewportRef.current;
    const track = e.currentTarget.parentElement;
    if (!viewport || !track) return;
    const maxScroll = viewport.scrollHeight - viewport.clientHeight;
    const trackTravel = track.clientHeight - thumb.height;
    if (trackTravel <= 0) return;
    const deltaY = e.clientY - dragRef.current.startY;
    const scrollDelta = (deltaY / trackTravel) * maxScroll;
    viewport.scrollTop = dragRef.current.startScroll + scrollDelta;
  };

  const onThumbPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    dragRef.current.active = false;
    e.currentTarget.releasePointerCapture(e.pointerId);
  };

  return (
    <div className={`shop-scroll-region relative min-h-0 ${className}`.trim()}>
      <div ref={viewportRef} className="shop-scroll-region__viewport h-full min-h-0 overflow-y-auto">
        {children}
      </div>
      {thumb.visible && (
        <div
          className="shop-scroll-region__track"
          onClick={onTrackClick}
          role="presentation"
          aria-hidden
        >
          <div
            className="shop-scroll-region__thumb"
            style={{ transform: `translateY(${thumb.top}px)`, height: thumb.height }}
            onPointerDown={onThumbPointerDown}
            onPointerMove={onThumbPointerMove}
            onPointerUp={onThumbPointerUp}
            onPointerCancel={onThumbPointerUp}
          />
        </div>
      )}
    </div>
  );
}
