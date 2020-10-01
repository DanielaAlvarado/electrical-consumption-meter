import React from 'react';
import ReactDOM from'react-dom';
import Chart from './Chart';

class GenerateShowChart extends React.Component{
    constructor(props){
        super(props);
    }

    showChart(){
        ReactDOM.unmountComponentAtNode(document.getElementById('device-screen'));
        ReactDOM.render(
            <Chart/>,
            document.getElementById('device-screen')
        );
    }

    render(){
        return (
            <div>
                <div className="just-screen" id="device-screen"></div>
                <button className="room-item" onClick={this.showChart.bind(this)}><h2 className="room-name">Visualizar</h2></button>
            </div>
        );
    }
}

ReactDOM.render(
    <GenerateShowChart/>,
    document.getElementById('root')
);

export default function ShowChart(){
    return (
        <GenerateShowChart/>
    );
}