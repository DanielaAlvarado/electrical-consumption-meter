import React, {Component} from 'react';
import ReactDOM from'react-dom';
import PropTypes from 'prop-types';
import DeviceScreen from './DeviceScreen.js';
import { ReactComponent } from 'react';

class RoomComponent extends React.Component{
  
  constructor(props) {
    super(props);
    this.state = {
      id: '',
      name: '',
      type: '',
      items: [],
    };
    
  }

  static getDerivedStateFromProps(props, state) {
    return {
      id: props.id_room,
      name: props.name_room,
      type: props.type_room  
    };
  }
  
  componentDidMount(){
    fetch("http://localhost:5000/countDevices?id_room=" + this.state.id)
    .then(res => res.json())
    .then(
      (result) => {
        this.setState({
          items: result.items
        });
        // console.log(result);
      }
    ) 
  }

  getType(){
    var icon_type = "blank"
    var room_type = JSON.stringify(this.state.type);
    switch (room_type) {
      case "2":
        icon_type = "bano";
        break;
      case "3":
        icon_type = "biblioteca";
        break;
      case "4":
        icon_type = "cocina";
        break;
      case "5":
        icon_type = "comedor";
        break;
      case "6":
        icon_type = "cuarto";
        break;
      case "7":
        icon_type = "escaleras";
        break;
      case "8":
        icon_type = "estudio";
        break;
      case "9":
        icon_type = "gym";
        break;
      case "10":
        icon_type = "jardin";
        break;
      case "11":
        icon_type = "sala";
        break;
      default:
        icon_type = "blank";
        break;
    }
    return icon_type;
  }

  refreshPage(){
    window.location.reload(false);
  }

  handleClick(){
    //console.log("Update content", this.state.id);
    ReactDOM.unmountComponentAtNode(document.getElementById('device-screen'));
    this.showDevices();
  }

  showDevices() {
    ReactDOM.render(
      <DeviceScreen id_room={this.state.id} />,
      document.getElementById('device-screen')
    );
  }

  render() {
    const { items } = this.state;
      return (
        <div>
          <div className="just-screen" id="device-screen"></div>
          <button className="room-item" onClick={this.handleClick.bind(this)}>
              <div class="terms">
                <img className={`room-icon`} src={require('../icons/salas/' + this.getType() + '.png')} alt="Icon"/>
                <div className="room">
                  <h2 className="room-name">{this.state.name}</h2>
                  {items.map(d => (
                    <h1 className="device-count">
                      {d.devices} Dispositivos
                    </h1>)
                  )}
                </div>
              </div>
              
          </button>
        </div>

      );
  }
}

ReactDOM.render(
  <RoomComponent />,
  document.getElementById('root')
);

export default function Room({ room: { id, type, name} }) {
  return (
    <div>
      <RoomComponent id_room={id} type_room={type} name_room={name} />
    </div>
  );
}

Room.propTypes = {
    room: PropTypes.shape({
      id: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
    }),
  };

