import React, {
  createContext,
  useContext,
  useReducer,
  MutableRefObject
} from "react";

const initialState = {
  containerRef: null,
  stickyRefs: new Map()
};

// No operation
const noop = () => {};

const initialDispatch = {
  setContainerRef: noop,
  addStickyRef: noop
};

export interface ActionProps {
  setContainerRef: <T>(ref: MutableRefObject<T>) => void;
  addStickyRef: <T>(
    topSentinelRef: MutableRefObject<T>,
    bottomSentinelRef: MutableRefObject<T>,
    stickyRef: MutableRefObject<T>
  ) => void;
}

const StickyStateContext = createContext(initialState);
const StickyDispatchContext = createContext<ActionProps>(initialDispatch);

const ActionType = {
  setContainerRef: "set container ref",
  addStickyRef: "add sticky ref"
};

function reducer(state, action) {
  const { type, payload } = action;
  switch (type) {
    case ActionType.setContainerRef:
      // Reassigning a new ref, will infinitely re-load!
      return Object.assign(state, {
        containerRef: { current: payload.containerRef }
      });
    case ActionType.addStickyRef:
      const { topSentinelRef, bottomSentinelRef, stickyRef } = payload;

      state.stickyRefs.set(topSentinelRef.current, stickyRef);
      state.stickyRefs.set(bottomSentinelRef.current, stickyRef);

      return Object.assign(state, {
        stickyRefs: state.stickyRefs
      });
    default:
      return state;
  }
}

function StickyProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  const setContainerRef = containerRef =>
    dispatch({ type: ActionType.setContainerRef, payload: { containerRef } });

  const addStickyRef = (topSentinelRef, bottomSentinelRef, stickyRef) =>
    dispatch({
      type: ActionType.addStickyRef,
      payload: { topSentinelRef, bottomSentinelRef, stickyRef }
    });

  const actions = {
    setContainerRef,
    addStickyRef
  };

  return (
    <StickyStateContext.Provider value={state}>
      <StickyDispatchContext.Provider value={actions}>
        {children}
      </StickyDispatchContext.Provider>
    </StickyStateContext.Provider>
  );
}

function useStickyState() {
  const context = useContext(StickyStateContext);
  if (context === undefined)
    throw Error('"useStickyState should be used under "StickyStateContext');
  return context;
}

function useStickyActions() {
  const context = useContext(StickyDispatchContext);
  if (context === undefined)
    throw Error(
      '"useStickyActions should be used under "StickyDispatchContext'
    );
  return context;
}

export interface StickSectionProps<T> {
  topSentinelRef: MutableRefObject<T>;
  bottomSentinelRef: MutableRefObject<T>;
}
const initialSectionValues = {
  topSentinelRef: null,
  bottomSentinelRef: null
};

const StickySectionContext = createContext(initialSectionValues);

export {
  StickyProvider,
  useStickyState,
  useStickyActions,
  ActionType,
  StickySectionContext
};
