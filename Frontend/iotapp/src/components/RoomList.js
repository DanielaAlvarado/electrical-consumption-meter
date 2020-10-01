import React from 'react';
import ReactDOM from'react-dom';
import PropTypes from 'prop-types';
import Room from './Room.js';
import { connect } from 'react-redux';
import ShowChart from './ShowChart';

class GenerateRoomList extends React.Component{
  constructor(props) {
    super(props);
    this.state = {
      id: '',
      error: null,
      isLoaded: false,
      items: []
    };
  }

  static getDerivedStateFromProps(props, state) {
    return {
      id: props.id_stage, 
    };
  }

  componentDidMount() {
    console.log("[ID Stage] ", this.state.id);
    fetch("http://localhost:5000/searchRoom?id_stage=" + this.state.id)
    .then(res => res.json())
    .then(
      (result) => {
        this.setState({
          isLoaded: true,
          items: result.items
        });
        console.log("Rooms:", result);
      },
      (error) => {
        this.setState({
          isLoaded: true,
          error
        });
      }
    )
  }

  render() {
    const { error, isLoaded, items } = this.state;

    if (error) {
      return <div className="Error">Error</div>;
      
    } 
    else if (!isLoaded) {
      return <div>Cargando cuartos...</div>;
    } 
    else {

      return (
        <div>
          <div className="room-list">
            <ShowChart/>
            {items.map(item => (
                <Room room={item}/>
              ))}
          </div>
        </div>
      );

    }
  }
}

ReactDOM.render(
  <GenerateRoomList />,
  document.getElementById('root')
);


export function PureRoomList({ stage }) {
  return (
    <GenerateRoomList id_stage={stage}/>
  );
}

PureRoomList.propTypes = {
    stage: PropTypes.string.isRequired,
    rooms: PropTypes.arrayOf(Room.propTypes.room).isRequired,
  };
  
  PureRoomList.defaultProps = {
    loading: false,
  };
  
  export default connect(
    ({ rooms }) => ({
      rooms: rooms,
    }),

  )(PureRoomList);
