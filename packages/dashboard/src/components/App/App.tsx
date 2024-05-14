import type { AppRootProps } from '@grafana/data';
import React, { PureComponent } from 'react';
import { PluginPropsContext } from '../../utils/utils.plugin';
import { Routes } from '../Routes';

export class App extends PureComponent<AppRootProps> {
  render() {
    return (
      <PluginPropsContext.Provider value={this.props}>
        <Routes />
      </PluginPropsContext.Provider>
    );
  }
}
