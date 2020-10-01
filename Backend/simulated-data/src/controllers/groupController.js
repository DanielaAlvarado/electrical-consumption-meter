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
        const records = devices.map((device) => {
            const recordPath = path.join(__dirname, `../data/${req.query.month}-${device.id}.csv`);
            const recordBuffer = fs.readFileSync(recordPath);
            const recordString = recordBuffer.toString();

            const record = parse(recordString, {
                columns: true
            });

            return record.map((entry) => {
                return {
                    date: new Date(parseInt(entry.date)),
                    consumption: parseInt(entry.consumption)
                };
            });
        });

        const days = {};
        records.flat().forEach((entry) => {
            const day = moment(entry.date).startOf('day').format('MM-DD');
            days[day] = (days[day] || 0) + entry.consumption;
        })

        const formatted = Object.keys(days).map((day) => {
            return {
                day,
                consumption: days[day]
            };
        });
        res.send(formatted);
    }catch(error){
        console.log(error);
        res.status(500).send({
            message: 'Error al recuperar dispositivos'
        })
    }
};