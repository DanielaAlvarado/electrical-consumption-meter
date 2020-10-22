import React, { StrictMode } from 'react';
import ReactDOM from'react-dom';
import PropTypes from 'prop-types';
import AddButton from './AddDevice';
import DeviceList from './DeviceList';
import Device from './Device';

class GenerateDeviceScreen extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      id:'',
      name:'',
    };
  }
 
  static getDerivedStateFromProps(props, state) {
    return {
      id: props.id_room 
    };
  }

  componentDidMount() {
    fetch("http://localhost:5000/getNameRoom?id_room=" + this.state.id)
    .then(res => res.json())
    .then(
      (result) => {
        this.setState({
          name: result.name
        });        
      },
    )
  }

  render() {
    return(
      <div className="screen-device">
        <div className="fondo">
          <h1 className="screen-title">
            <span className="screen-message">{this.state.name}</span>
            <span className="screen-place" id="name"> [ Dispositivos ]</span>
          </h1>
        </div>
        <DeviceList room={this.state.id}/>
        <AddButton id_room={this.state.id} />
      </div>
    );
  }
}
ReactDOM.render(
  <GenerateDeviceScreen />,
  document.getElementById('root')
);
export default function DeviceScreen({ id_room }) {
  return (
    <GenerateDeviceScreen id_room={id_room}/>
  );
}

DeviceScreen.propTypes = {
  id_room: PropTypes.string.isRequired,
};

