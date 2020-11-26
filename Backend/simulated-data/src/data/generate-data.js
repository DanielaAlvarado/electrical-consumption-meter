const fs = require('fs');
const fetch = require('node-fetch');
const moment = require('moment');
const stringify = require('csv-stringify/lib/sync');

const generateData = async (offset) => {
    let response = await fetch('http://localhost:5000/devices');
    response = await response.json();

    const start = moment().subtract(offset, 'month').startOf('month');
    let end = moment().subtract(offset, 'month').endOf('month');
    const now = moment();
    if(now.isBefore(end)){
        end = now;
    }

    const devices = response.items;
    const records = devices.map((device) => {
        const record = [];
        for(let hour = moment(start); hour.isBefore(end); hour = hour.add(1, 'hour')){
            record.push({
                date: hour.toDate(),
                consumption: Math.floor(Math.random() * 100) + 1
            });
        }

        return record;
    });

    records.forEach((record, index) => {
        const recordString = stringify(record, {
            header: true
        });
        fs.writeFileSync(`${start.format('YYYY-MM')}-${devices[index].id}.csv`, recordString);
    });
};

generateData(0);