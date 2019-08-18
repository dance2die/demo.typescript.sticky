import React, {
  useEffect,
  useRef,
  useContext,
  useState,
  ReactNode,
  ComponentPropsWithRef
} from "react";

import {
  StickyProvider,
  useStickyActions,
  useStickyState,
  StickySectionContext
} from "./Context";

import styles from "./index.module.scss";

const noop = () => {};

export interface StickyProps {
  // https://github.com/typescript-cheatsheets/react-typescript-cheatsheet/blob/master/README.md#useful-react-prop-type-examples
  children: ReactNode;
  className: string;
  as: ComponentPropsWithRef<any>;
}
export interface StickyRootProps {
  children: ReactNode;
  as: ComponentPropsWithRef<any>;
}
export type ChangeType = {
  type: "stuck" | "unstuck";
  target: HTMLElement;
};
export interface StickySectionProps {
  as: ComponentPropsWithRef<any>;
  onChange: (e: ChangeType) => void;
  onStuck: (target: HTMLElement) => void;
  onUnstuck: (target: HTMLElement) => void;
  // https://github.com/typescript-cheatsheets/react-typescript-cheatsheet/blob/master/README.md#useful-react-prop-type-examples
  children: ReactNode;
}

// const Sticky = React.FC<StickyProps> = ({ children, as = "div", ...rest }) => {
function Sticky({
  children,
  as = "div",
  className = "",
  ...rest
}: StickyProps) {
  const { topSentinelRef, bottomSentinelRef } = useContext(
    StickySectionContext
  );
  const dispatch = useStickyActions();

  // So that we can retrieve correct child target element
  // from either a top sentinel or a bottom sentinel
  const addStickyRef = stickyRef => {
    dispatch.addStickyRef(topSentinelRef, bottomSentinelRef, stickyRef);
  };

  const Component = as;

  return (
    <Component
      ref={addStickyRef}
      className={styles.sticky + className === "" ? "" : ` ${className}`}
      {...rest}
    >
      {children}
    </Component>
  );
}

function StickySection({
  as: Component = "section",
  onChange = noop,
  onStuck = noop,
  onUnstuck = noop,
  children,
  ...rest
}: StickySectionProps) {
  const sectionRef = useRef(null);
  const topSentinelRef = useRef(null);
  const bottomSentinelRef = useRef(null);

  const { stickyRefs, containerRef } = useStickyState();
  const [targetHeight, setTargetHeight] = useState("");
  const [sentinelMarginTop, setSentinelMarginTop] = useState("");

  // Move the sentinel up by the top margin of the sticky component
  useEffect(() => {
    const topSentinel = stickyRefs.get(topSentinelRef.current);

    const topStyle = window.getComputedStyle(topSentinel);
    const getProp = name => topStyle.getPropertyValue(name);
    const paddingtop = getProp("padding-top");
    const paddingBottom = getProp("padding-bottom");
    const height = getProp("height");
    const marginTop = getProp("margin-top");

    const targetHeight = `calc(${marginTop} +
      ${paddingtop} +
      ${height} +
      ${paddingBottom})`;

    setTargetHeight(targetHeight);
    setSentinelMarginTop(marginTop);
  }, [stickyRefs]);

  // handle TOP sentinels
  // https://developers.google.com/web/updates/2017/09/sticky-headers
  useEffect(() => {
    if (!containerRef) return;
    if (!containerRef.current) return;
    const root = containerRef.current;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const target = stickyRefs.get(entry.target);
          const targetInfo = entry.boundingClientRect;
          const rootBoundsInfo = entry.rootBounds;

          let type: "stuck" | "unstuck";
          // Started sticking.
          if (targetInfo.bottom < rootBoundsInfo.top) {
            type = "stuck";
            onStuck(target);
          }

          // Stopped sticking.
          if (
            targetInfo.bottom >= rootBoundsInfo.top &&
            targetInfo.bottom < rootBoundsInfo.bottom
          ) {
            type = "unstuck";
            onUnstuck(target);
          }

          type && onChange({ type, target });
        });
      },
      { threshold: [0], root }
    );

    const sentinel = topSentinelRef.current;
    sentinel && observer.observe(sentinel);
    return () => observer.unobserve(sentinel);
  }, [topSentinelRef, onChange, onStuck, onUnstuck, stickyRefs, containerRef]);

  // handle BOTTOM sentinels
  useEffect(() => {
    if (!containerRef) return;
    if (!containerRef.current) return;
    const root = containerRef.current;

    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          const target = stickyRefs.get(entry.target);
          const targetInfo = entry.boundingClientRect;
          const rootBoundsInfo = entry.rootBounds;
          const ratio = entry.intersectionRatio;

          let type: "stuck" | "unstuck";
          // Started sticking.
          if (targetInfo.bottom > rootBoundsInfo.top && ratio === 1) {
            type = "stuck";
            onStuck(target);
          }

          // Stopped sticking.
          if (
            targetInfo.top < rootBoundsInfo.top &&
            targetInfo.bottom < rootBoundsInfo.bottom
          ) {
            type = "unstuck";
            onUnstuck(target);
          }

          type && onChange({ type, target });
        });
      },
      { threshold: [1], root }
    );

    const sentinel = bottomSentinelRef.current;
    sentinel && observer.observe(sentinel);
    return () => observer.unobserve(sentinel);
  }, [
    bottomSentinelRef,
    onChange,
    onStuck,
    onUnstuck,
    stickyRefs,
    containerRef
  ]);

  const value = { topSentinelRef, bottomSentinelRef };
  return (
    <StickySectionContext.Provider value={value}>
      <Component ref={sectionRef} className={styles.sticky__section} {...rest}>
        <div
          ref={topSentinelRef}
          style={{ marginTop: `-${sentinelMarginTop}` }}
          className={styles.sticky__sentinel_top}
        >
          sentinel top
        </div>
        {children}
        <div
          ref={bottomSentinelRef}
          style={{
            height: `${targetHeight}`
          }}
          className={styles.sticky__sentinel_bottom}
        >
          sentinel bottom
        </div>
      </Component>
    </StickySectionContext.Provider>
  );
}

function StickyRoot({
  children,
  as: Component = "div",
  ...rest
}: StickyRootProps) {
  const dispatch = useStickyActions();

  const addContainerRef = containerRef => {
    dispatch.setContainerRef(containerRef);
  };

  return (
    <Component ref={addContainerRef} {...rest}>
      {children}
    </Component>
  );
}

function StickyContainer({ children, as: Component = "div", ...rest }) {
  return (
    <StickyProvider>
      <StickyRoot as={Component} {...rest}>
        {children}
      </StickyRoot>
    </StickyProvider>
  );
}

export {
  StickyContainer,
  StickySection,
  Sticky,
  useStickyState,
  useStickyActions
};
