import React, { StrictMode } from 'react';
import ReactDOM from'react-dom';
import PropTypes from 'prop-types';
import AddButton from './AddDevice';
import DeviceList from './DeviceList';
import Popup from 'reactjs-popup';

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

  deleteRoom(){
    var request = new XMLHttpRequest();
    request.onreadystatechange = (e) => {
      if (request.readyState !== 4) {
        return;
      }
      if (request.status === 200) {
        console.log('deleted', request.responseText);
        this.refreshPage();
      } else {
        console.warn('error');
      }
    };
    request.open('GET', 'http://localhost:5000/deleteRoom?id_room='+ this.state.id);
    request.send(); 
  }

  refreshPage(){
    window.location.reload(false);
  }

  render() {
    return(
      <div className="screen-device">
        <div className="fondo">
          <h1 className="screen-title">
            <span className="screen-message">{this.state.name}</span>
            <span className="screen-place" id="name"> [ Dispositivos ]</span>
            <Popup trigger={
                <span className="screen__delete" id="name"> [ Eliminar ]</span>
            } modal>
                {close => (
                    <div className="modal">
                        <a className="close" onClick={close}>
                            &times;
                        </a>           
                        <div className="content">
                            <h1 className="pregunta">
                            ¿Estás seguro de eliminar "{this.state.name}"?
                            </h1>
                        </div>
                        <div className="actions">
                            <button className="aceptar" onClick={() => { this.deleteRoom(); close();}}> Aceptar </button>
                            <button className="cancelar" onClick={() => { close();}}> Cancelar </button>
                        </div>
                    </div>
                )}
            </Popup>
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

