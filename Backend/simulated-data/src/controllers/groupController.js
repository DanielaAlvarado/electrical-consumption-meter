const fs = require('fs');
const path = require('path');
const fetch = require('node-fetch');
const moment = require('moment');
const parse = require('csv-parse/lib/sync');

exports.month = async (req, res) => {
    try{
        let response = await fetch('http://localhost:5000/devices');
        response = await response.json();

        const devices = response.items;
        const columns = ['day'];
        const records = devices.map((device) => {
            let type;
            switch(device.type){
                case 1:
                    type = 'Bocinas';
                    break;
                case 2:
                    type = 'Consolas';
                    break;
                case 3:
                    type = 'Luces';
                    break;
                case 4:
                    type = 'Televisiones';
                    break;
                case 5:
                    type = 'Clima';
                    break;
                case 6:
                    type = 'Impresoras';
                    break;
                case 7:
                    type = 'Lavadoras';
                    break;
                case 8:
                    type = 'Licuadoras';
                    break;
                case 10:
                    type = 'Computadoras';
                    break;
                case 11:
                    type = 'Refrigeradores';
                    break;
                case 13:
                    type = 'Cafeteras';
                    break;
                case 14:
                    type = 'Microondas';
                    break;
            }
            if(!columns.includes(type)){
                columns.push(type);
            }

            const recordPath = path.join(__dirname, `../data/${req.query.month}-${device.id}.csv`);
            const recordBuffer = fs.readFileSync(recordPath);
            const recordString = recordBuffer.toString();

            const record = parse(recordString, {
                columns: true
            });

            return record.map((entry) => {
                return {
                    date: new Date(parseInt(entry.date)),
                    consumption: parseInt(entry.consumption),
                    type
                };
            });
        });
        console.log(records);

        const days = {};
        records.flat().forEach((entry) => {
            const day = moment(entry.date).startOf('day').format('MM-DD');
            days[day] = days[day] || {};
            days[day][entry.type] = (days[day][entry.type] || 0) + entry.consumption;
        })

        const formatted = Object.keys(days).map((day) => {
            return {
                day,
                ...days[day]
            };
        });

        const result = {
            data: formatted,
            columns
        }

        res.send(result);
    }catch(error){
        console.log(error);
        res.status(500).send({
            message: 'Error al recuperar dispositivos'
        })
    }
};

exports.week = async (req, res) => {
    try{
        let response = await fetch('http://localhost:5000/devices');
        response = await response.json();

        const weekStart = moment(req.query.week);
        const weekEnd = moment(req.query.week).add(6, 'days');
    
        const startMonth = weekStart.format('YYYY-MM');
        const endMonth = weekEnd.format('YYYY-MM')
        const months = [startMonth];
        if(endMonth != startMonth){
            months.push(endMonth);
        }

        const devices = response.items;
        const columns = ['day'];
        const records = months.map((month) => {
            return devices.map((device) => {
                let type;
                switch(device.type){
                    case 1:
                        type = 'Bocinas';
                        break;
                    case 2:
                        type = 'Consolas';
                        break;
                    case 3:
                        type = 'Luces';
                        break;
                    case 4:
                        type = 'Televisiones';
                        break;
                    case 5:
                        type = 'Clima';
                        break;
                    case 6:
                        type = 'Impresoras';
                        break;
                    case 7:
                        type = 'Lavadoras';
                        break;
                    case 8:
                        type = 'Licuadoras';
                        break;
                    case 10:
                        type = 'Computadoras';
                        break;
                    case 11:
                        type = 'Refrigeradores';
                        break;
                    case 13:
                        type = 'Cafeteras';
                        break;
                    case 14:
                        type = 'Microondas';
                        break;
                }
                if(!columns.includes(type)){
                    columns.push(type);
                }
    
                const recordPath = path.join(__dirname, `../data/${month}-${device.id}.csv`);
                const recordBuffer = fs.readFileSync(recordPath);
                const recordString = recordBuffer.toString();
    
                const record = parse(recordString, {
                    columns: true
                });
    
                return record.map((entry) => {
                    return {
                        date: new Date(parseInt(entry.date)),
                        consumption: parseInt(entry.consumption),
                        type
                    };
                });
            });
        }).flat();
       
        const days = {};
        records.flat().forEach((entry) => {
            const date = moment(entry.date).startOf('day');
            
            if(date.isBetween(weekStart, weekEnd, null, '[]')){
                const day = date.format('MM-DD');
                days[day] = days[day] || {};
                days[day][entry.type] = (days[day][entry.type] || 0) + entry.consumption;
            }
        })

        const formatted = Object.keys(days).map((day) => {
            return {
                day,
                ...days[day]
            };
        });

        const result = {
            data: formatted,
            columns
        }

        res.send(result);
    }catch(error){
        console.log(error);
        res.status(500).send({
            message: 'Error al recuperar dispositivos'
        })
    }
};