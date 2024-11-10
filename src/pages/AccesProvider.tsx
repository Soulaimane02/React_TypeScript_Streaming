import React, { createContext, useContext, useState } from 'react';

interface AccessContextProps {
  hasAccess: boolean;
  grantAccess: () => void;
}

const AccessContext = createContext<AccessContextProps | undefined>(undefined);

export const AccessProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [hasAccess, setHasAccess] = useState<boolean>(!!localStorage.getItem('accessGranted'));

  const grantAccess = () => {
    localStorage.setItem('accessGranted', 'true');
    setHasAccess(true);
  };

  return (
    <AccessContext.Provider value={{ hasAccess, grantAccess }}>
      {children}
    </AccessContext.Provider>
  );
};

export const useAccess = () => {
  const context = useContext(AccessContext);
  if (!context) throw new Error("useAccess must be used within an AccessProvider");
  return context;
};
