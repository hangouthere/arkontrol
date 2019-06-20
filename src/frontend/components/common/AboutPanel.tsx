import { Classes, Drawer, Position } from '@blueprintjs/core';
import React from 'react';

interface IProps {
  className?: string;
}

interface IState {
  isOpen: boolean;
}

class AboutPanel extends React.PureComponent<IProps, IState> {
  state: IState = {
    isOpen: false
  };

  handleOpen = () => this.setState({ isOpen: true });
  handleClose = () => this.setState({ isOpen: false });

  render() {
    return (
      <div id="About" className={this.props.className}>
        <div className={this.props.className} onClick={this.handleOpen}>
          {this.props.children}
        </div>

        <Drawer
          icon="info-sign"
          className="bp3-dark"
          title="ArKontrol"
          isOpen={this.state.isOpen}
          onClose={this.handleClose}
          position="right"
        >
          <div className={Classes.DRAWER_BODY}>
            <div className={Classes.DIALOG_BODY}>
              <p>
                ArKontrol started as a simple desire to see the current player list on our Community Ark Server, and
                somehow blew up into a complete tooling accessible on every platform.
              </p>
              <p>
                In essence, this is a giant wrapper around RCON, and various technologies integrated to provide a simple
                app to control and monitor your Ark Server.
              </p>
              <p>
                From setting up automated messaging, to administering bans, ArKontrol will allow you to perform anything
                possible via remote on your Ark Server.
              </p>
            </div>
          </div>
          <div className={`${Classes.DRAWER_FOOTER} flex-display`}>
            <span className="flex-grow" />
            <a href="http://rebrand.ly/nfgDiscord" target="_blank">
              Discord
            </a>
            &nbsp;•&nbsp;
            <a href="http://rebrand.ly/nfgTwitter" target="_blank">
              Twitter
            </a>
            &nbsp;•&nbsp;
            <a href="http://streamlabs.com/nfgCodex" target="_blank">
              Donate
            </a>
          </div>
        </Drawer>
      </div>
    );
  }
}

export default AboutPanel;
