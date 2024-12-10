import React, { createContext, useContext, useState } from 'react';
import { t } from 'i18next';

interface HeaderMenuContextProps {
  selectedFranchise: any | null;
  setSelectedFranchise: (franchise: any | null) => void;
  selectedLocations: any[];
  setSelectedLocations: (locations: any[]) => void;
}

const HeaderMenuContext = createContext<HeaderMenuContextProps | undefined>(
  undefined
);

export const HeaderMenuProvider: React.FC<{ children: React.ReactNode }> = ({
  children
}) => {
  const [selectedFranchise, setSelectedFranchise] = useState<any | null>(null);
  const [selectedLocations, setSelectedLocations] = useState<any[]>([]);

  return (
    <HeaderMenuContext.Provider
      value={{
        selectedFranchise,
        setSelectedFranchise,
        selectedLocations,
        setSelectedLocations
      }}
    >
      {children}
    </HeaderMenuContext.Provider>
  );
};

export const useHeaderMenu = () => {
  const context = useContext(HeaderMenuContext);
  if (!context) {
    throw new Error('useHeaderMenu must be used within a HeaderMenuProvider');
  }
  return context;
};
