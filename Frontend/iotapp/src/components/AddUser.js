import React, {Component} from 'react';
import ReactDOM from'react-dom';
import PropTypes from 'prop-types';
import Popup from 'reactjs-popup';

class GenerateUser extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      email: '',
      password: ''
    };
    this.changeTextName = this.changeTextName.bind(this);
    this.changeTextEmail = this.changeTextEmail.bind(this);
    this.changeTextPassword = this.changeTextPassword.bind(this);
  }

  changeTextName(event) {
    this.setState({name: event.target.value});
  }
  changeTextEmail(event) {
    this.setState({email: event.target.value});
  }
  changeTextPassword(event) {
    this.setState({password: event.target.value});
  }

  createUser(name, email, password) {
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
    request.open('GET', 'http://localhost:5000/insert?name='+ name +'&email='+ email +'&password='+ password +'&admin=1&stage=1');
    request.send();  
  }

  refreshPage(){
    window.location.reload(false);
  }
  ret

  render() {
    return (
      <div>
        {/* <Popup trigger={
            <button className="add-user">
                Usuarios 
              <img className="add-img" src={require('../icons/flecha_abajo.png')} alt="Icon"/>
            </button>
        } modal>
          {close => (
            <div className="modal">
              <a className="close" onClick={close}>
                &times;
              </a>           
              <div className="header"> CREAR USUARIO </div>
              <div className="content">

                <div className="title-form-device">
                  <div class="terms3">
                    <p className="requirement">*</p>
                    <h1 className="label-form-device"> CORREO </h1>
                  </div>
                </div>
                <div>
                  <input class="input-text-device" type="text" value={this.state.email}
                   onChange={this.changeTextEmail}></input>
                </div>

   
                <div className="title-form-device">
                  <p></p><p></p>
                  <div class="terms3">
                    <p className="requirement">*</p>
                    <h1 className="label-form-device"> NOMBRE </h1>
                  </div>
                </div>
                <div>
                  <input class="input-text-device" type="text" value={this.state.name} 
                  onChange={this.changeTextName}></input>
                </div>

                <div className="title-form-device">
                  <p></p><p></p>
                  <div class="terms3">
                    <p className="requirement">*</p>
                    <h1 className="label-form-device"> CONTRASEÑA </h1>
                  </div>
                </div>
                <div>
                  <input class="input-text-device" type="text" value={this.state.password} 
                  onChange={this.changeTextPassword}></input>
                </div>
                
              </div>
              <div className="actions">
                <button onClick={() => {this.createUser(this.state.name, this.state.email, this.state.password); close();}} className="crear"> CREAR </button>
                <div class="terms3">
                    <p className="requirementc">*</p>
                    <p className="campos">Campos obligatorios.</p>
                </div>
              </div>
            </div>
          )}
        </Popup> */}

      </div>
    );
  }
}

ReactDOM.render(
  <GenerateUser />,
  document.getElementById('root')
);


export default function AddUser() {

  return (
    <GenerateUser />
  );
}

AddUser.propTypes = {
    addUser: PropTypes.shape({
      username: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      email: PropTypes.string.isRequired,
      password: PropTypes.string.isRequired,
    }),
  };