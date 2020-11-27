import React from 'react';
import ReactDOM from'react-dom';
import * as d3 from 'd3';
import * as moment from 'moment';
import {DatePicker} from "@material-ui/pickers";
import {MuiPickersUtilsProvider} from '@material-ui/pickers';
import MomentUtils from '@date-io/moment';
import "moment/locale/es";
import {SingleSelect} from 'react-select-material-ui';
import clsx from 'clsx';
import {IconButton} from '@material-ui/core';
import {withStyles, createStyles} from '@material-ui/core/styles';
import {legendColor} from 'd3-svg-legend'; 
import Tabs from 'muicss/lib/react/tabs';
import Tab from 'muicss/lib/react/tab';

moment.locale('es');

class GenerateChart extends React.PureComponent {
    constructor(props){
        super(props);
    
        this.state = {
            view: 'Mensual',
            tab: 0,
            room: -1,
            selectedMonth: moment(),
            selectedWeek: moment().startOf('week'),
            status: true,
            rooms: []
        };
    }

    async componentDidMount(){
        let response = await fetch('http://localhost:5000/searchRoom?id_stage=1');
        response = await response.json();
        this.setState({
            rooms: response.items.map((room) => {
                return {
                    label: room.name,
                    value: room.id
                }
            })
        });

        this.buildDeviceChart();
        this.buildRoomChart();
    }

    handleViewSelection(view){
        this.setState({
            view
        }, () => {
            this.buildDeviceChart();
            this.buildRoomChart();
        });
    }

    handleMonthSelection(month){
        this.setState({
            selectedMonth: month
        }, () => {
            this.buildDeviceChart();
            this.buildRoomChart();
        });
    }

    handleWeekSelection(week){
        this.setState({
            selectedWeek: moment(week).startOf('week')
        }, () => {
            this.buildDeviceChart();
            this.buildRoomChart();
        });
    }


    handleRoomSelection(room){
        this.setState({
            room
        }, () => {
            this.buildDeviceChart();
        });
    }

    async buildDeviceChart(){
        d3.select(this.refs.monthView).selectAll('*').remove();
        d3.select(this.refs.weekView).selectAll('*').remove();

        if(this.state.view == 'Mensual'){
            let response = await fetch(`http://localhost:3001/groups/devicesMonthly?month=${this.state.selectedMonth.format('YYYY-MM')}&room=${this.state.room}`);

            if(response.status == 200){
                response = await response.json();
                this.setState({
                    status: true
                });

                const data = response.data.map((point) => {
                    let consumption = 0;
                    Object.keys(point).forEach((type) => {
                        if(type != 'day'){
                            consumption += point[type];
                        }
                    });

                    return {
                        day: point.day,
                        consumption
                    };
                });
                const columns = ['day', 'consumption'];
                const series = columns.slice(1).map((key) => {
                    return data.map(({[key]: value, day}) => {
                        return {
                            key,
                            day,
                            value
                        }
                    });
                });

                const margin = {
                    top: 30,
                    right: 50, 
                    bottom: 30,
                    left: 40
                };
                const height = 400;
                const width = 800;

                const x = d3.scalePoint().domain([0].concat(data.map((point) => {
                    return point.day;
                }))).range([margin.left, width - margin.right]);
                const y = d3.scaleLinear().domain([d3.min(series, (serie) => {
                    return d3.min(serie, (point) => {
                        return point.value;
                    });
                }) - 100, d3.max(series, (serie) => {
                    return d3.max(serie, (point) => {
                        return point.value;
                    });
                })]).range([height - margin.bottom, margin.top]);
                const z = d3.scaleOrdinal(columns.slice(1), d3.schemeCategory10);

                const xAxis = (g) => {
                    return g.attr('transform', `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x).tickSizeOuter(0));
                };
                const yAxis = (g) => {
                    return g.attr('transform', `translate(${margin.left},0)`).call(d3.axisLeft(y).ticks(null, 's'));
                };

                const svg = d3.select(this.refs.monthView).append('svg').attr('viewBox', [0, 0, width, height]);
                const tooltip = svg.append('g');
                svg.append('g').call(xAxis);
                svg.append('g').call(yAxis);
                svg.on('click', (event) => {
                    d3.select(this.refs.dayView).selectAll('*').remove();
                });

                const serie = svg.append('g').selectAll('g').data(series).join('g');
                serie.append('path').attr('fill', 'none').attr('stroke', (point) => {
                    return z(point[0].key);
                }).attr('stroke-width', 1.5).attr('d', d3.line().x((point) => {
                    return x(point.day);
                }).y((point) => {
                    return y(point.value);
                }));
                
                const that = this;
                serie.append('g').attr('font-family', 'sans-serif').attr('font-size', 10).attr('stroke-linecap', 'round').attr('stroke-linejoin', 'round').attr('text-anchor', 'middle').selectAll('text').data((point) => {
                    return point;
                }).join('circle').attr('cx', (point) => {
                    return x(point.day);
                }).attr('cy', (point) => {
                    return y(point.value);
                }).attr('r', (point, index) => {
                    return 5;
                }).style('fill', '#fcb0b5').on('mouseover', function(event){
                    d3.select(this).transition().duration(200).style('fill', '#d30715');

                    const [xPosition, yPosition] = d3.pointer(event, this);
                    const domain = x.domain();
                    const range = x.range();
                    const rangePoints = d3.range(range[0], range[1], x.step());
                    const point = {};
                    point.day = domain[d3.bisect(rangePoints, xPosition)];
                    point.consumption = y.invert(yPosition);

                    tooltip.append('text').attr('id', 'label').text(Math.round(point.consumption)).attr('y', yPosition - 12).attr('x', xPosition);
                    tooltip.append('line').attr('id', 'path').attr('x1', xPosition).attr('y1', yPosition).attr('x2', xPosition).attr('y2', height - margin.bottom).attr('stroke', 'black').attr('stroke-dasharray', ('3, 3'));
                }).on('mouseout', function(event){
                    d3.select(this).transition().duration(500).style('fill', '#fcb0b5');

                    tooltip.selectAll('#label').remove();
                    tooltip.selectAll('#path').remove();
                }).on('click', function(event){
                    event.stopPropagation();

                    const xPosition = d3.pointer(event, this)[0]
                    const domain = x.domain();
                    const range = x.range();
                    const rangePoints = d3.range(range[0], range[1], x.step());
                    const day = domain[d3.bisect(rangePoints, xPosition)];
                    
                    that.buildDayChart(response.data.filter((point) => {
                        return point.day == day;
                    }), response.columns);
                });

                this.buildLegend(response.data, response.columns.slice(1));
            }else{
                this.setState({
                    status: false
                });
            }
        }else{
            let response = await fetch(`http://localhost:3001/groups/devicesWeekly?week=${this.state.selectedWeek.format('YYYY-MM-DD')}&room=${this.state.room}`);
            
            if(response.status == 200){
                response = await response.json();
                this.setState({
                    status: true
                });

                const {data, columns} = response;
                const series = d3.stack().keys(columns.slice(1))(data).map((point) => {
                    point.forEach((entry) => {
                        entry.key = point.key;
                    });

                    return point;
                });

                const margin = {
                    top: 30,
                    right: 0,
                    bottom: 30,
                    left: 40
                };
                const height = 400;
                const width = 800;

                const x = d3.scaleBand().domain(data.map((point) => {
                    return point.day;
                })).range([margin.left, width - margin.right]).padding(0.1);
                const y = d3.scaleLinear().domain([0, d3.max(series, (point) => {
                    return d3.max(point, (point) => {
                        return point[1];
                    });
                })]).rangeRound([height - margin.bottom, margin.top]);
                
                const xAxis = (g) => {
                    return g.attr('transform', `translate(0,${height - margin.bottom})`).call(d3.axisBottom(x).tickSizeOuter(0)).call((g) => {
                        return g.selectAll('.domain').remove();
                    });
                };
                const yAxis = (g) => {
                    return g.attr('transform', `translate(${margin.left},0)`).call(d3.axisLeft(y).ticks(null, 's')).call((g) => {
                        return g.selectAll('.domain').remove();
                    });
                };

                const color = d3.scaleOrdinal().domain(series.map((point) => {
                    return point.key;
                })).range(d3.schemeCategory10).unknown('#ccc');

                const svg = d3.select(this.refs.weekView).append('svg').attr('viewBox', [0, 0, width, height]);
                svg.append('g').selectAll('g').data(series).join('g').attr('fill', (point) => {
                    return color(point.key);
                }).selectAll('rect').data((point) => {
                    return point
                }).join('rect').attr('x', (point, index) => {
                    return x(point.data.day);
                }).attr('y', (point) => {
                    return y(point[1]);
                }).attr('height', (point) => {
                    return y(point[0]) - y(point[1]);
                }).attr('width', x.bandwidth()).append('title').text((point) => {
                    return `${point.data.day} ${point.key}
                    ${point.data[point.key]}`;
                });
                
                svg.append('g').call(xAxis);
                svg.append('g').call(yAxis);

                this.buildLegend(data, columns.slice(1));
            }else{
                this.setState({
                    status: false
                });
            }
        }
    }

    buildDayChart(data, columns){
        d3.select(this.refs.dayView).selectAll('*').remove();
        const series = d3.stack().keys(columns.slice(1))(data).map((point) => {
            point.forEach((entry) => {
                entry.key = point.key;
            });

            return point;
        });

        const margin = {
            top: 30,
            right: 0,
            bottom: 30,
            left: 40
        };
        const height = 400;
        const width = 200;

        const x = d3.scaleBand().domain(data.map((point) => {
            return point.day;
        })).range([margin.left, width - margin.right]).padding(0.1);
        const y = d3.scaleLinear().domain([0, d3.max(series, (point) => {
            return d3.max(point, (point) => {
                return point[1];
            });
        })]).rangeRound([height - margin.bottom, margin.top]);

        const color = d3.scaleOrdinal().domain(series.map((point) => {
            return point.key;
        })).range(d3.schemeCategory10).unknown('#ccc');

        const svg = d3.select(this.refs.dayView).append('svg').attr('viewBox', [0, 0, width, height]);
        svg.append('g').selectAll('g').data(series).join('g').attr('fill', (point) => {
            return color(point.key);
        }).selectAll('rect').data((point) => {
            return point
        }).join('rect').attr('x', (point, index) => {
            return x(point.data.day);
        }).attr('y', (point) => {
            return y(point[1]);
        }).attr('height', (point) => {
            return y(point[0]) - y(point[1]);
        }).attr('width', x.bandwidth()).append('title').text((point) => {
            return `${point.data.day} ${point.key}
            ${point.data[point.key]}`;
        });
    }

    buildLegend(data, types){
        d3.select(this.refs.legend).selectAll('*').remove();

        const consumptionByType = {};
        let totalConsumption = 0;

        data.forEach((point) => {
            Object.keys(point).forEach((type) => {
                if(type != 'day'){
                    if(!consumptionByType[type]){
                        consumptionByType[type] = {};
                    }
                    
                    consumptionByType[type].consumption = (consumptionByType[type].consumption || 0) + point[type];
                    totalConsumption += point[type];
                }
            })
        });
        Object.keys(consumptionByType).forEach((type) => {
            consumptionByType[type].percentage = Math.round(consumptionByType[type].consumption / totalConsumption * 100);
        });

        types = types.sort((type1, type2) => {
            return consumptionByType[type2].percentage - consumptionByType[type1].percentage;
        }).map((type) => {
            return `${type}: ${consumptionByType[type].percentage}%`;
        });

        for(let i = 0; i < 4; i++){
            const column = types.slice(i * 3, i * 3 + 3);
            const scheme = d3.schemeCategory10.slice(i * 3, i * 3 + 3)

            const scale = d3.scaleOrdinal().domain(column).range(scheme);
            const legend = legendColor().scale(scale);

            const svg = d3.select(this.refs.legend).append('svg').attr('width', 200);
            svg.append('g').attr('class', 'legendOrdinal').attr('transform', 'translate(20, 20)');

            svg.select('.legendOrdinal').call(legend);   
        }     
    }

    async buildRoomChart(){
        d3.select(this.refs.roomView).selectAll('*').remove();

        let data = [];
        if(this.state.view == 'Mensual'){
            let response = await fetch(`http://localhost:3001/groups/roomsMonthly?month=${this.state.selectedMonth.format('YYYY-MM')}`);
            data = await response.json();
        }else{
            let response = await fetch(`http://localhost:3001/groups/roomsWeekly?week=${this.state.selectedWeek.format('YYYY-MM-DD')}`);
            data = await response.json();
        }

        const margin = {
            top: 30,
            right: 0,
            bottom: 10,
            left: 100
        }
        const barHeight = 50;
        const height = Math.ceil((data.length + 0.1) * barHeight) + margin.top + margin.bottom;
        const width = 800;

        const x = d3.scaleLinear().domain([0, d3.max(data, (point) => {
            return point.consumption;
        })]).range([margin.left, width - margin.right]);
        const y = d3.scaleBand().domain(d3.range(data.length)).rangeRound([margin.top, height - margin.bottom]).padding(0.1);

        const xAxis = (g) => {
            return g.attr('transform', `translate(0,${margin.top})`).call(d3.axisTop(x).ticks(width / 80)).call((g) => {
                return g.select('.domain').remove();
            });
        };
        const yAxis = (g) => {
            return g.attr('transform', `translate(${margin.left},0)`).call(d3.axisLeft(y).tickFormat((index) => {
                return data[index].room;
            }).tickSizeOuter(0));
        };

        const svg = d3.select(this.refs.roomView).append('svg').attr('viewBox', [0, 0, width, height]);
        svg.append('g').attr('fill', 'steelblue').selectAll('rect').data(data).join('rect').attr('x', x(0)).attr('y', (point, index) => {
            return y(index);
        }).attr('width', (point) => {
            return x(point.consumption) - x(0);
        }).attr('height', y.bandwidth());
        svg.append('g').attr('fill', 'white').attr('text-anchor', 'end').attr('font-family', 'sans-serif').attr('font-size', 12).selectAll('text').data(data).join('text').attr('x', (point) => {
            return x(point.consumption);
        }).attr('y', (point, index) => {
            return y(index) + y.bandwidth() / 2;
        }).attr('dy', '0.35em').attr('dx', -4).text((point) => {
            return `${point.consumption} (${point.percentage}%)`;
        }).call((text) => {
            return text.filter((point) => {
                return x(point.consumption) - x(0) < 20;
            }).attr('dx', +4).attr('fill', 'black').attr('text-anchor', 'start');
        });

        svg.append('g').call(xAxis);
        svg.append('g').call(yAxis);
    }

    renderWrappedWeekDay = (date, selectedDate, dayInCurrentMonth) => {
        const {classes} = this.props;
        
        const start = moment(selectedDate).startOf('week');
        const end = moment(selectedDate).endOf('week');

        const dayIsBetween = date.isBetween(start, end, null, '[]');
        const isFirstDay = date.isSame(start, 'day');
        const isLastDay = date.isSame(end, 'day');

        const wrapperClassName = clsx({
            [classes.highlight]: dayIsBetween,
            [classes.firstHighlight]: isFirstDay,
            [classes.endHighlight]: isLastDay
        });
        const dayClassName = clsx(classes.day, {
            [classes.nonCurrentMonthDay]: !dayInCurrentMonth,
            [classes.highlightNonCurrentMonthDay]: !dayInCurrentMonth && dayIsBetween
        });

        return (
            <div className={wrapperClassName}>
                <IconButton className={dayClassName}>
                    <span>{date.format('D')}</span>
                </IconButton>
            </div>
        );
    }
    
    formatWeekSelectLabel = (date, invalidLabel) => {
        const dateClone = moment(date);

        return dateClone && dateClone.isValid() ? `Semana del ${dateClone.startOf('week').format('D MMM')}` : invalidLabel;
    }

    onTabChange(tab){
        this.setState({
            tab: tab
        });

        this.buildDeviceChart();
        this.buildRoomChart();
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
                    <SingleSelect className="chart__view-selector" label="Selecciona una vista" value={this.state.view} options={['Mensual', 'Semanal']} onChange={(view) => this.handleViewSelection(view)}/>
                    <MuiPickersUtilsProvider className="chart__date-selector" utils={MomentUtils} locale={"es"}>
                        {this.state.view == 'Mensual' ? 
                            <DatePicker openTo="month" views={["year", "month"]} label="Selecciona un mes" value={this.state.selectedMonth} onChange={(month) => this.handleMonthSelection(month)}/>
                            :
                            <DatePicker label="Selecciona una semana" value={this.state.selectedWeek} onChange={(week) => this.handleWeekSelection(week)} renderDay={this.renderWrappedWeekDay} labelFunc={this.formatWeekSelectLabel}/>
                        }
                    </MuiPickersUtilsProvider>
                    <SingleSelect className="chart__room-selector" label="Selecciona un escenario" value={this.state.room} options={[{label: 'Todos', value: -1}].concat(this.state.rooms)} onChange={(room) => this.handleRoomSelection(room)} style={this.state.tab == 0 ? {visibility: 'visible'} : {visibility: 'hidden'}}/>
                </div>
                <Tabs justified={true} onChange={(tab) => this.onTabChange(tab)}>
                    <Tab value="pane-1" label="Dispositivos">
                        {!this.state.status ?
                        <div className="chart__error">
                            <img className="error-icon" src={require('../icons/sadface.png')} alt="Icon"/>
                            No hay datos para el periodo seleccionado
                        </div>
                        :
                        <div>
                            {this.state.view == 'Mensual' ?
                            <div className="chart">
                                <div ref="monthView" className="chart__view"></div>
                                <div ref="dayView" className="chart__day"></div>
                            </div>
                            :
                            <div className="chart">
                                <div ref="weekView" className="chart__view"></div>
                            </div>
                            }
                            <div ref="legend"></div>
                        </div>}
                    </Tab>
                    <Tab value="pane-2" label="Escenarios">
                        
                    <div className="chart">
                        <div ref="roomView" className="chart__view"></div>
                    </div>
                    </Tab>
                </Tabs>
            </div>
        );
    }
}

ReactDOM.render(
    <GenerateChart/>,
    document.getElementById('root')
);

const styles = createStyles((theme) => ({
    dayWrapper: {
        position: "relative",
    },
    day: {
        width: 36,
        height: 36,
        fontSize: theme.typography.caption.fontSize,
        margin: "0 2px",
        color: "inherit",
    },
    customDayHighlight: {
        position: "absolute",
        top: 0,
        bottom: 0,
        left: "2px",
        right: "2px",
        border: `1px solid ${theme.palette.secondary.main}`,
        borderRadius: "50%",
    },
    nonCurrentMonthDay: {
        color: theme.palette.text.disabled,
    },
    highlightNonCurrentMonthDay: {
        color: "#676767",
    },
    highlight: {
        background: theme.palette.primary.main,
        color: theme.palette.common.white,
    },
    firstHighlight: {
        extend: "highlight",
        borderTopLeftRadius: "50%",
        borderBottomLeftRadius: "50%",
    },
    endHighlight: {
        extend: "highlight",
        borderTopRightRadius: "50%",
        borderBottomRightRadius: "50%",
    },
}));

export default withStyles(styles)(GenerateChart);