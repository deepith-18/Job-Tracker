import React, { useRef, useState, useEffect, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ style?: React.CSSProperties; className?: string }>;
  badge?: string | number;
}

export interface ScrollableTabBarProps {
  tabs: TabItem[];
  activeTab: string;
  onSelectTab: (tabId: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const ScrollableTabBar: React.FC<ScrollableTabBarProps> = ({
  tabs,
  activeTab,
  onSelectTab,
  className = '',
  style = {},
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasMovedRef = useRef(false);

  // Check scroll positions to show/hide scroll buttons and edge gradient masks
  const checkScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    // Allow a small 2px tolerance for subpixel rendering
    setCanScrollLeft(scrollLeft > 3);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 3);
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    checkScroll();

    const handleResize = () => checkScroll();
    window.addEventListener('resize', handleResize);

    // Also observe container size changes via ResizeObserver
    let resizeObserver: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined') {
      resizeObserver = new ResizeObserver(() => checkScroll());
      resizeObserver.observe(el);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      resizeObserver?.disconnect();
    };
  }, [checkScroll, tabs]);

  // Convert mouse wheel (deltaY) into horizontal scrolling on desktop
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      // If primarily vertical scroll and horizontal overflow exists
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX) && el.scrollWidth > el.clientWidth) {
        const canScrollL = el.scrollLeft > 0;
        const canScrollR = el.scrollLeft + el.clientWidth < el.scrollWidth - 1;

        // If scrolling down (right) and can scroll right, or scrolling up (left) and can scroll left
        if ((e.deltaY > 0 && canScrollR) || (e.deltaY < 0 && canScrollL)) {
          e.preventDefault();
          el.scrollLeft += e.deltaY;
          checkScroll();
        }
      }
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, [checkScroll]);

  // Smoothly center or scroll active tab into view when it changes
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const activeBtn = el.querySelector<HTMLButtonElement>(`[data-tab-id="${activeTab}"]`);
    if (activeBtn) {
      const containerLeft = el.scrollLeft;
      const containerRight = containerLeft + el.clientWidth;
      const btnLeft = activeBtn.offsetLeft;
      const btnRight = btnLeft + activeBtn.clientWidth;

      // If active tab is out of visible view or close to edge, scroll it smoothly into view
      if (btnLeft < containerLeft + 40 || btnRight > containerRight - 40) {
        const targetScroll = btnLeft - el.clientWidth / 2 + activeBtn.clientWidth / 2;
        el.scrollTo({
          left: Math.max(0, targetScroll),
          behavior: 'smooth',
        });
      }
    }
    // Recheck scroll after animation
    const timeout = setTimeout(checkScroll, 300);
    return () => clearTimeout(timeout);
  }, [activeTab, checkScroll]);

  // Smooth scroll button handlers
  const scrollByAmount = (amount: number) => {
    const el = containerRef.current;
    if (!el) return;
    el.scrollBy({ left: amount, behavior: 'smooth' });
    setTimeout(checkScroll, 320);
  };

  // Mouse drag-to-scroll implementation
  const handleMouseDown = (e: React.MouseEvent) => {
    // Only drag with primary mouse button
    if (e.button !== 0) return;
    const el = containerRef.current;
    if (!el) return;

    isDraggingRef.current = true;
    hasMovedRef.current = false;
    startXRef.current = e.pageX;
    scrollLeftRef.current = el.scrollLeft;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const el = containerRef.current;
    if (!el) return;

    const dx = e.pageX - startXRef.current;
    if (Math.abs(dx) > 4) {
      hasMovedRef.current = true;
    }
    el.scrollLeft = scrollLeftRef.current - dx;
    checkScroll();
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
    setIsDragging(false);
  };

  return (
    <div
      className="scrollable-tab-wrapper"
      style={{
        position: 'relative',
        width: '100%',
        maxWidth: '100%',
        display: 'flex',
        alignItems: 'center',
        ...style,
      }}
    >
      {/* Left Scroll Navigation Button & Gradient Mask */}
      {canScrollLeft && (
        <>
          <div
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
              bottom: 2,
              width: 48,
              background: 'linear-gradient(to right, var(--bg-page) 55%, transparent 100%)',
              zIndex: 10,
              pointerEvents: 'none',
              transition: 'opacity 0.2s ease',
            }}
          />
          <button
            type="button"
            onClick={() => scrollByAmount(-240)}
            className="tab-nav-arrow-btn left"
            aria-label="Scroll tabs left"
            title="Scroll tabs left"
            style={{
              position: 'absolute',
              left: 2,
              zIndex: 20,
              width: 28,
              height: 28,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--card)',
              color: 'var(--t1)',
              border: '1px solid var(--border)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.background = 'var(--card-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.background = 'var(--card)';
            }}
          >
            <ChevronLeft style={{ width: 16, height: 16 }} />
          </button>
        </>
      )}

      {/* Main Tab Bar Container */}
      <div
        ref={containerRef}
        className={`page-tab-bar ${className}`.trim()}
        onScroll={checkScroll}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        role="tablist"
        style={{
          display: 'flex',
          gap: 6,
          overflowX: 'auto',
          overflowY: 'hidden',
          width: '100%',
          paddingBottom: 4,
          cursor: isDragging ? 'grabbing' : 'default',
          userSelect: isDragging ? 'none' : 'auto',
          WebkitOverflowScrolling: 'touch',
          scrollBehavior: 'smooth',
        }}
      >
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              data-tab-id={tab.id}
              role="tab"
              aria-selected={isActive}
              onClick={(e) => {
                // If user dragged, don't trigger click
                if (hasMovedRef.current) {
                  e.preventDefault();
                  return;
                }
                onSelectTab(tab.id);
              }}
              className={`page-tab-btn${isActive ? ' active' : ''}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                fontSize: 13,
                fontWeight: 600,
                whiteSpace: 'nowrap',
                flexShrink: 0,
                cursor: 'pointer',
              }}
            >
              {Icon && <Icon style={{ width: 15, height: 15, flexShrink: 0 }} />}
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span
                  style={{
                    fontSize: 11,
                    padding: '1px 6px',
                    borderRadius: 10,
                    background: isActive ? 'var(--accent)' : 'var(--border)',
                    color: isActive ? '#ffffff' : 'var(--t3)',
                    fontWeight: 700,
                  }}
                >
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Right Scroll Navigation Button & Gradient Mask */}
      {canScrollRight && (
        <>
          <div
            style={{
              position: 'absolute',
              right: 0,
              top: 0,
              bottom: 2,
              width: 48,
              background: 'linear-gradient(to left, var(--bg-page) 55%, transparent 100%)',
              zIndex: 10,
              pointerEvents: 'none',
              transition: 'opacity 0.2s ease',
            }}
          />
          <button
            type="button"
            onClick={() => scrollByAmount(240)}
            className="tab-nav-arrow-btn right"
            aria-label="Scroll tabs right"
            title="Scroll tabs right"
            style={{
              position: 'absolute',
              right: 2,
              zIndex: 20,
              width: 28,
              height: 28,
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'var(--card)',
              color: 'var(--t1)',
              border: '1px solid var(--border)',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'scale(1.1)';
              e.currentTarget.style.background = 'var(--card-hover)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'scale(1)';
              e.currentTarget.style.background = 'var(--card)';
            }}
          >
            <ChevronRight style={{ width: 16, height: 16 }} />
          </button>
        </>
      )}
    </div>
  );
};
