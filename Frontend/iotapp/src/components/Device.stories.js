import React from 'react';
import { storiesOf } from '@storybook/react';
import { action, decorate } from '@storybook/addon-actions';
import { withKnobs, text, boolean, number} from "@storybook/addon-knobs";
import Device from './Device';

export const device = {
  id: '1',
  type: 'foco',
  name: 'Test Device',
  state: 'DEVICE_INBOX',
  updatedAt: new Date(2018, 0, 1, 9, 0),
};

export const actions = {
  offDevice: action('offDevice'),
  disabledDevice: action('disabledDevice'),
};

storiesOf('Device', module)
  .add('default', () => <Device device={{ ...device, name: text("Name device", "Test device"),
    decorators: [withKnobs]}} {...actions} />)
  .add('off', () => <Device device={{ ...device, state: 'DEVICE_OFF' }} {...actions} />)
  .add('disable', () => <Device device={{ ...device, state: 'DEVICE_DISABLE' }} {...actions} />);