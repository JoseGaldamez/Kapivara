# 🧠 Kapivara React & Architecture Recommendations

Welcome to the Kapivara Architecture and Performance Checklist. This document applies modern React 19 standards and the **Vercel React Best Practices** engineering guide to Kapivara's **Controller-Service-View** architecture.

---

## 🏎️ 1. Re-render Optimization & State Isolation (`rerender-`)

*The biggest performance issue in typical React developer tools is massive, cascading re-renders when a user types into high-frequency input controls (like URLs, headers, or body panels).*

- [ ] **Decouple High-Frequency Input States (Typing Lag Protection)**
  - **Context**: In `RequestPanel.tsx`, typing a single character into the URL or Request Body text fields triggers changes in local `useState` buffers, which forces the entire `RequestPanel.tsx` (541 lines, plus multiple sub-tabs, dropdowns, and status bars) to completely re-render on every keystroke.
  - **Action**: Use uncontrolled inputs with `useRef` or isolated low-level inputs that debounce updates back to the parent container.
  - **Code Suggestion**:
    ```tsx
    // Extract Form inputs into isolated self-rendering leaf components
    export const URLInput = memo(({ initialUrl, onChange }: { initialUrl: string; onChange: (v: string) => void }) => {
      const [localUrl, setLocalUrl] = useState(initialUrl);
      const debouncedOnChange = useMemo(() => debounce(onChange, 150), [onChange]);

      return (
        <input
          value={localUrl}
          onChange={(e) => {
            setLocalUrl(e.target.value);
            debouncedOnChange(e.target.value);
          }}
        />
      );
    });
    ```

- [ ] **Apply `rerender-memo` to Sidebar Tree Nodes**
  - **Context**: `CollectionNode.tsx` and `DraggableRequestItem.tsx` compose the entire request sidebar. If a single request's status changes or a sidebar item is dragged, the entire tree can trigger redundant re-renders.
  - **Action**: Wrap list elements in `React.memo` with custom comparison props (`prev.isActive === next.isActive` and `prev.name === next.name`) to prevent downstream rendering of unaffected items.

- [ ] **Eliminate Duplicate Sync Effects (Draft Scratchpad Pattern)**
  - **Context**: `RequestPanel.tsx` contains heavy `useEffect` hooks (lines 108-134) that trigger on `request.id` changes, parsing strings (`JSON.parse`) back and forth between stores and state. This creates memory allocations and layout updates.
  - **Action**: Introduce a "Zustand Draft Scratchpad" in `request.store.ts` that acts as the temporary state buffer for active editing. Keep state mutations in the store, avoiding local duplicate buffers in React entirely.

---

## ⚡ 2. Eliminating Waterfalls & Pre-Caching (`async-`)

*Tauri IPC bridges (`invoke`) have small but measurable asynchronous serialization overheads. Minimizing async lifecycle waterfalls in React is crucial for instant-feeling desktop UI.*

- [ ] **Eliminate Asynchronous Effects for Variable Previews**
  - **Context**: In `RequestPanel.tsx` (lines 100-106) and `Sidebar.tsx` (lines 58-68), an asynchronous effect triggers `environmentController.getResolvedVariables` whenever project environments change.
  - **Action**: Calculate and cache resolved variables inside the `useEnvironmentStore` during bootstrap or environment activation. Make `resolvedVariables` a static, synchronously readable selector in the React render flow, completely avoiding asynchronous state waterfalls.
  - **Code Suggestion**:
    ```tsx
    // Inside environment.store.ts
    interface EnvironmentState {
      resolvedVariables: Record<string, string>;
      // ...
    }
    // Read synchronously in views:
    const resolvedVariables = useEnvironmentStore((state) => state.resolvedVariables);
    ```

- [ ] **Use Cheap Sync Checks Before DB Queries (`async-cheap-condition-before-await`)**
  - **Context**: Controllers load database entries frequently.
  - **Action**: Check if stores already contain loaded data before awaiting backend DB queries, returning cached structures instantly to prevent visual flashing.

---

## 📦 3. Bundle Size & Import Optimizations (`bundle-`)

*Vite packages your client app into optimized assets. Let's make sure imports are modular and statically analyzable.*

- [ ] **Avoid Barrel Imports (`bundle-barrel-imports`)**
  - **Context**: `RequestPanel.tsx` imports all tab panels together:
    ```tsx
    import { QueryParamsTab, AuthorizationTab, HeadersTab, BodyTab, Tabs } from "./tabs";
    ```
  - **Action**: Import components directly from their specific files instead of aggregating them inside index/barrel files (e.g. `tabs/index.ts`). Barrel imports can prevent tree-shaking and complicate compiler bundles.

- [ ] **Dynamically Load Heavy Panels (`bundle-dynamic-imports`)**
  - **Action**: Dynamic components like `JsonViewer` or large panels like `SavedResponsesPanel` are not needed until execution finishes. Lazy-load these modules using React's `lazy` and `<Suspense>` to keep initial startup speeds blazingly fast.

---

## 📂 4. Component Modularization & Structure

*Clean project architecture requires clean file separation, making code simple to trace and test.*

- [ ] **Fragment `RequestPanel.tsx` (Single Responsibility Principle)**
  - **Context**: `RequestPanel.tsx` is currently a monolith of 541 lines.
  - **Action**: Split the component into four distinct files under a `src/components/workspace/request` subdirectory:
    1. `RequestHeader.tsx`: Handles request renaming and save status indicators.
    2. `RequestEditorTabs.tsx`: Houses query params, auth, custom headers, and body options.
    3. `ResponseVisualizer.tsx`: Houses the collapsible resizer and response status bars.
    4. `EmptyStateView.tsx`: Displays suggestions when endpoints fail or requests are empty.

- [ ] **Extract Environment Logic from the Sidebar**
  - **Context**: `Sidebar.tsx` contains 350+ lines, including an intensive environment-selection dropdown, variable grid layouts, and active variable tags.
  - **Action**: Extract this entire panel into a standalone component (`src/components/sidebar/EnvironmentSelector.tsx`) to simplify the main sidebar tree container.

---

## 🛠️ 5. Clean JavaScript & React 19 Best Practices

- [ ] **Implement Lazy State Initializers (`rerender-lazy-state-init`)**
  - **Context**: `RequestPanel.tsx` parses JSON parameters directly during render initialization (lines 46-70):
    ```tsx
    const [queryParams, setQueryParams] = useState<RequestParam[]>(() => { ... });
    ```
    Passing parsing callbacks is good! Ensure *every* parsing or initial computation inside `useState` uses lazy initializer functions `() => init()` to prevent expensive re-parsing on subsequent render sweeps.

- [ ] **Safeguard React 19 Mismatch Warnings (`rendering-conditional-render`)**
  - **Action**: Avoid the logical `&&` operator when conditional values can resolve to empty nodes or numbers like `0` (which outputs literal `0` into the DOM in React 19). Always prefer ternary operators `? <Component /> : null` or explicit boolean conversion `!!value && ...`.

- [ ] **Clean Controllers Async Errors Handling**
  - **Action**: Ensure all controllers implement high-level fallback error states when calling Tauri services, preventing unhandled promise rejections from crashing the desktop webview context.
