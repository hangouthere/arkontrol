import React from 'react';
import Navigation from './Navigation';

const Layout: React.FC = props => {
  return (
    <div className="layout bp3-dark">
      <Navigation />

      <section className="content">{props.children}</section>
    </div>
  );
};

export default Layout;
