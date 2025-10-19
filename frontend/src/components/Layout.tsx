import React from 'react';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{ maxWidth: 960, margin: '24px auto', padding: '0 16px' }}>
      {children}
    </div>
  );
};

export default Layout;
