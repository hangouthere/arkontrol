import { Alignment, Button, Navbar } from '@blueprintjs/core';
import React from 'react';
import { NavButton } from '../containers/NavButton';

const Navigation: React.FC = () => (
  <Navbar className="Navbar">
    <Navbar.Group>
      <Navbar.Heading>ArKontrol</Navbar.Heading>
      <Navbar.Divider />
      <NavButton icon="user" text="Players" to="/" exact={true} className="bp3-minimal" />
      <NavButton icon="clean" text="Socket Demo" to="/socketDemo" exact={true} className="bp3-minimal" />
    </Navbar.Group>

    <Navbar.Group align={Alignment.RIGHT}>
      <Button className="bp3-minimal" icon="log-in" intent="success" />
    </Navbar.Group>
  </Navbar>
);

export default Navigation;
