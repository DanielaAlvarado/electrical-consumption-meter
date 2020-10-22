import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import AddButtonRoom from './AddRoom';
import RoomList from './RoomList';

export function PureRoomScreen({id_stage}) {
  return (
      <div className="screen-room">
        <nav>
          <h1 className="screen-title">
            <span className="screen-message">Escenarios</span>
          </h1>
        </nav>
        <RoomList stage={id_stage}/>
        <AddButtonRoom addButtonRoom={{}} />
      </div>
  );
}

PureRoomScreen.propTypes = {
  error: PropTypes.string,
};

PureRoomScreen.defaultProps = {
  error: null,
};

export default connect(({ error }) => ({ error }))(PureRoomScreen);