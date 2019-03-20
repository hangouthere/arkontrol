import * as React from 'react';

export default class Counter extends React.Component<{}, { count: number }> {
  interval: number = 0;
  state = { count: 0 };

  // This state will be maintained during hot reloads
  componentWillMount() {
    this.interval = window.setInterval(() => {
      this.setState({ count: this.state.count + 1 });
    }, 1000);
  }

  componentWillUnmount() {
    window.clearInterval(this.interval);
  }

  render() {
    return (
      <div>
        <div>Current Count: {this.state.count}</div>
      </div>
    );
  }
}
