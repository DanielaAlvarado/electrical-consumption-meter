import React, {Component} from 'react';
import ReactDOM from'react-dom';
import PropTypes from 'prop-types';
import Popup from 'reactjs-popup';


class GenerateDevice extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      type: '',
      room: '',
      attempts: '0',
    };
    this.changeText = this.changeText.bind(this);
    this.changeRadio = this.changeRadio.bind(this);
  }
  static getDerivedStateFromProps(props, state) {
    return {
      room: props.id_room,
    };
  }
  changeText(event) {
    this.setState({name: event.target.value});
  }

  changeRadio(event) {
    this.setState({type: event.target.value});
  }

  checkName(name, type, room) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = (e) => {
      if (request.readyState !== 4) {
        return;
      }
      if (request.status === 200) {
        console.log('success');
        this.createDevice(name, type, room);
      } else {
        console.warn('error');
        this.showAlertRepeatedName();
      } 
    };
    request.open('GET', 'http://localhost:5000/searchDevice?name_device=' + name + '&id_room='+ room);
    request.send(); 
  }

  createDevice(name, type, room) {
    var request = new XMLHttpRequest();
    request.onreadystatechange = (e) => {
      if (request.readyState !== 4) {
        return;
      }
      if (request.status === 200) {
        console.log('success', request.responseText);
        this.refreshPage();
      } else {
        console.warn('error');
      } 
    };
    request.open('GET', 'http://localhost:5000/insertDevice?name_device='+name+'&id_room='+room+'&type_idtype='+type);
    request.send(); 
  }

  showAlertType() {
    const alert = document.getElementById("missing_type");
    alert.insertAdjacentHTML("beforeend",
    "<p id='alert'> ¡Es necesario elegir un tipo de dispositivo! </p>");;
  }
  showAlertName(){
    var i = document.getElementById("missing_name");
    i.insertAdjacentHTML("beforeend",
    "<p id='alert'> ¡Es necesario escribir un nombre! </p>");
  }
  showAlertRepeatedName(){
    var i = document.getElementById("missing_name");
    i.insertAdjacentHTML("beforeend",
    "<p id='alert'> ¡Ese nombre ya existe! </p>");
  }

  deleteAlert(){
    var alert = document.getElementById("alert");
    if(alert != null){
      alert.remove(alert);
    }
  }

  insertDevice(name, type, room){
    this.deleteAlert();
      if(type != ''){
        if(name != ''){
          this.checkName(name, type, room);
        }
        else{
          this.showAlertName();
        }
      }
      else{
        this.showAlertType();
      }
  }

  refreshPage(){
    window.location.reload(false);
  }

  render() {
    return (
      <div>
        <Popup trigger={
          <button className={`add-device`} >
          <div class="terms">
            <img className={`device-icon`} src={require('../icons/otro.png')} alt="Icon"/>
            <h2 className="device-name"> Agregar </h2>
          </div>
        </button>
        } modal>
          {close => (
            <div className="modal">
              <a className="close" onClick={close}>
                &times;
              </a>           
              <div className="header"> AÑADIR NUEVO DISPOSITIVO </div>
              <div className="content">

                <div className="title-form-device">
                  <div class="terms3">
                    <p className="requirement">*</p>
                    <h1 className="label-form-device"> TIPO DE DISPOSITIVO </h1>
                    <p className="missing-name" id="missing_type"></p>
                  </div>

                  <div class="section over-hide z-bigger">
                    <input class="checkbox" type="checkbox" name="general" id="general"></input>
                            
                            <input class="checkbox-tools" type="radio" name="tools" id="tool-1" 
                            value="1" checked={this.state.type === "1"} onChange={this.changeRadio}></input>
                            <label class="for-checkbox-tools" for="tool-1">
                            <img className="icon-size" src={require('../icons/dispositivos/Bocina.png')} alt="Icon"/>
                            Bocina
                            </label>

                            <input class="checkbox-tools" type="radio" name="tools" id="tool-2"
                            value="2" checked={this.state.type === "2"} onChange={this.changeRadio}></input>
                            <label class="for-checkbox-tools" for="tool-2">
                            <img className="icon-size" src={require('../icons/dispositivos/Consola.png')} alt="Icon"/>
                            Consola
                            </label>

                            <input class="checkbox-tools" type="radio" name="tools" id="tool-3"
                            value="3" checked={this.state.type === "3"} onChange={this.changeRadio}></input>
                            <label class="for-checkbox-tools" for="tool-3">
                            <img className="icon-size" src={require('../icons/dispositivos/Luz.png')} alt="Icon"/>
                            <br></br>Luz
                            </label>

                            <input class="checkbox-tools" type="radio" name="tools" id="tool-4"
                            value="4" checked={this.state.type === "4"} onChange={this.changeRadio}></input>
                            <label class="for-checkbox-tools" for="tool-4">
                            <img className="icon-size" src={require('../icons/dispositivos/TV.png')} alt="Icon"/>
                            Televisión
                            </label>

                            <input class="checkbox-tools" type="radio" name="tools" id="tool-5"
                            value="5" checked={this.state.type === "5"} onChange={this.changeRadio}></input>
                            <label class="for-checkbox-tools" for="tool-5">
                            <img className="icon-size" src={require('../icons/dispositivos/Clima.png')} alt="Icon"/>
                            <br></br>Clima
                            </label>

                            <input class="checkbox-tools" type="radio" name="tools" id="tool-6"
                            value="6" checked={this.state.type === "6"} onChange={this.changeRadio}></input>
                            <label class="for-checkbox-tools" for="tool-6">
                            <img className="icon-size" src={require('../icons/dispositivos/Impresora.png')} alt="Icon"/>
                            Impresora
                            </label>

                            <input class="checkbox-tools" type="radio" name="tools" id="tool-7"
                            value="7" checked={this.state.type === "7"} onChange={this.changeRadio}></input>
                            <label class="for-checkbox-tools" for="tool-7">
                            <img className="icon-size" src={require('../icons/dispositivos/Lavadora.png')} alt="Icon"/>
                            Lavadora
                            </label>

                            <input class="checkbox-tools" type="radio" name="tools" id="tool-8"
                            value="8" checked={this.state.type === "8"} onChange={this.changeRadio}></input>
                            <label class="for-checkbox-tools" for="tool-8">
                            <img className="icon-size" src={require('../icons/dispositivos/Licuadora.png')} alt="Icon"/>
                            Licuadora
                            </label>

                            <input class="checkbox-tools" type="radio" name="tools" id="tool-10"
                            value="10" checked={this.state.type === "10"} onChange={this.changeRadio}></input>
                            <label class="for-checkbox-tools" for="tool-10">
                            <img className="icon-size" src={require('../icons/dispositivos/PC.png')} alt="Icon"/>
                            Computadora
                            </label>

                            <input class="checkbox-tools" type="radio" name="tools" id="tool-11"
                            value="11" checked={this.state.type === "11"} onChange={this.changeRadio}></input>
                            <label class="for-checkbox-tools" for="tool-11">
                            <img className="icon-size" src={require('../icons/dispositivos/Refrigerador.png')} alt="Icon"/>
                            Refrigerador
                            </label>

                            <input class="checkbox-tools" type="radio" name="tools" id="tool-13"
                            value="13" checked={this.state.type === "13"} onChange={this.changeRadio}></input>
                            <label class="for-checkbox-tools" for="tool-13">
                            <img className="icon-size" src={require('../icons/dispositivos/Cafetera.png')} alt="Icon"/>
                            Cafetera
                            </label>

                            <input class="checkbox-tools" type="radio" name="tools" id="tool-14"
                            value="14" checked={this.state.type === "14"} onChange={this.changeRadio}></input>
                            <label class="for-checkbox-tools" for="tool-14">
                            <img className="icon-size" src={require('../icons/dispositivos/Microondas.png')} alt="Icon"/>
                            Microondas
                            </label>
                  </div>		

                </div>

                <div className="title-form-device">
                  <p></p><p></p>
                  <div class="terms3">
                    <p className="requirement">*</p>
                    <h1 className="label-form-device">NOMBRE DEL DISPOSITIVO</h1><br></br>
                    <span className="missing-name" id="missing_name"></span>
                  </div>
                </div>
                <div>
                  <input class="input-text-device" type="text" value={this.state.name} onChange={this.changeText}></input>
                </div>
                
              </div>
              <div className="actions">
                <button onClick={() => {this.insertDevice(this.state.name, this.state.type, this.state.room);}} className="crear"> CREAR </button>
                <div class="terms3">
                    <p className="requirementc">*</p>
                    <p className="campos">Campos obligatorios.</p>
                  </div>
              </div>
            </div>
          )}
        </Popup>

      </div>
    );
  }
}

ReactDOM.render(
  <GenerateDevice />,
  document.getElementById('root')
);


export default function AddButton({id_room}) {

  return (
    <GenerateDevice  id_room={id_room}/>
  );
}

AddButton.propTypes = {
    addButton: PropTypes.shape({
      name: PropTypes.string.isRequired,
    }),
  };