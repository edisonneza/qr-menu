import { createContext, useContext, useState } from "react";

type UIContextType = {
  drawerOpen: boolean;
  toggleDrawer: () => void;
  pageTitle: string;
  setPageTitle: (t: string) => void;
};

const UIContext = createContext<UIContextType>(null!);

export const UIProvider = ({ children }: { children: React.ReactNode }) => {
  const [drawerOpen, setDrawerOpen] = useState(true);
  const [pageTitle, setPageTitle] = useState("Dashboard");

  return (
    <UIContext.Provider
      value={{
        drawerOpen,
        toggleDrawer: () => setDrawerOpen((prev) => !prev),
        pageTitle,
        setPageTitle
      }}
    >
      {children}
    </UIContext.Provider>
  );
};

export const useUI = () => useContext(UIContext);
