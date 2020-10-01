import React from 'react';
import ReactDOM from'react-dom';
import * as d3 from 'd3';
import * as moment from 'moment';
import {DatePicker} from "@material-ui/pickers";
import { MuiPickersUtilsProvider } from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import "moment/locale/es";

moment.locale('en');

class GenerateChart extends React.Component{
    constructor(props){
        super(props);
        
        this.state = {
            selectedDate: moment(),
            status: true
        };
    }

    componentDidMount(){
        this.buildChart(this.state.selectedDate);
    }

    async buildChart(date){
        const response = await fetch(`http://localhost:3001/groups/month?month=${date.format('YYYY-MM')}`);
        d3.select(this.refs.chart).selectAll('*').remove();
        
        if(response.status == 200){
            const data = await response.json();
            this.setState({
                status: true
            });

            const margin = {
                top: 30,
                right: 0,
                bottom: 30,
                left: 40
            };
            const height = 500;
            const width = 1000;

            const x = d3.scaleBand().domain(d3.range(data.length)).range([margin.left, width - margin.right]).padding(0.1);
            const y = d3.scaleLinear().domain([0, d3.max(data, (point) => {
                return point.consumption;
            })]).nice().range([height - margin.bottom, margin.top]);
            
            const xAxis = (g) => {
                return g.attr('transform', `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x).tickFormat((index) => {
                    return data[index].day;
                }).tickSizeOuter(0));
            };
            const yAxis = (g) => {
                return g.attr('transform', `translate(${margin.left},0)`).call(d3.axisLeft(y)).call((g) => {
                    return g.select('.domain').remove();
                }).call((g) => {
                    return g.append('text').attr('x', -margin.left).attr('y', 10).attr('fill', 'currentColor').attr('text-anchor', 'start');
                });
            };

            const svg = d3.select(this.refs.chart).append('svg').attr('viewBox', [0, 0, width, height]);
            svg.append('g').attr('fill', 'steelblue').selectAll('rect').data(data).join('rect').attr('x', (point, index) => {
                return x(index);
            }).attr('y', (point) => {
                return y(point.consumption);
            }).attr('height', (point) => {
                return y(0) - y(point.consumption);
            }).attr('width', x.bandwidth());

            svg.append('g').call(xAxis);
            svg.append('g').call(yAxis);
        }else{
            this.setState({
                status: false
            });
        }
    }

    handleMonthSelection(date){
        this.setState(({
            selectedDate: date
        }));

        this.buildChart(date);
    }

    render(){
        return (
            <div className="screen-device">
                <div className="fondo">
                    <h1 className="screen-title">
                        <span className="screen-message">Visualización</span>
                    </h1>
                </div>
                <div className="chart__date">
                    <MuiPickersUtilsProvider utils={MomentUtils} locale={"es"}>
                        <DatePicker openTo="month" views={["year", "month"]} label="Selecciona un mes" value={this.state.selectedDate} onChange={(date) => this.handleMonthSelection(date)}/>
                    </MuiPickersUtilsProvider>
                </div>
                {this.state.status ?
                <div ref="chart" className="device-list"></div>
                :
                <div className="chart__error">
                    <img className="error-icon" src={require('../icons/sadface.png')} alt="Icon"/>
                    No hay datos para el periodo seleccionado
                </div>
                }
            </div>
        );
    }
}

ReactDOM.render(
    <GenerateChart/>,
    document.getElementById('root')
);

export default function Chart(){
    return (
        <GenerateChart/>
    );
}