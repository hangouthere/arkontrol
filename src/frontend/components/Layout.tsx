import React from 'react';
import Navigation from '../containers/common/Navigation';

const Layout: React.FC = props => {
  return (
    <div id="Layout" className="bp3-dark">
      <Navigation />

      <section id="Content">{props.children}</section>
    </div>
  );
};

export default Layout;
