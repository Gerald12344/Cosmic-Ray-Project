var fs = require('fs');
let pressure = fs.readFileSync("json2.json", "utf8");
let data = fs.readFileSync("events.tsv", "utf8")
const headerHunter = `This data contains the following columns`;

const headings = [];
const output = [];

let passedHeadingStart = false;
let headingSkip = false;
let passedHeadings = false;

data.split("\n").forEach(item => {
  if (item.startsWith("#")) { // Comment / header
    if (item.indexOf(headerHunter) !== -1) {
      passedHeadingStart = true;

      return;
    }

    const clean = item.trim().replace(new RegExp("#", "g"), "");

    if (passedHeadingStart && clean.replace(new RegExp(" ", "g"), "").length === 0) { // This is a spacer
      if (!headingSkip) {
        headingSkip = true;

        return;
      }

      if (!passedHeadings) {
        passedHeadings = true;

        return;
      }
    }

    if (passedHeadingStart && !passedHeadings) {
      const subParts = clean.split(":");
      let name = subParts[0].trim();

      if (name.indexOf("(") !== -1) {
        // This means we need to create a bunch of data headers
        const count = parseInt(name.substring(name.indexOf("(") + 1).replace("x", "").replace(")", ""));
        name = name.substring(0, name.indexOf("(")).trim();

        for (let i = 0; i < count; i++) {
          headings.push(name + "_" + i);
        }

        return;
      }

      headings.push(name);
    }
  } else {
    // This is a datapoint
    let splitData = item.split("\t");

    if (splitData.length === 1) {
      splitData = item.split("    "); // Some IDE's may convert the tabs...
    }

    if (splitData.length <= 1) {
      return; // End of line data probably
    }

    const constructingObject = {};

    let i = 0;
    splitData.forEach(dataValue => {
      const heading = headings[i++];

      switch (heading) {
        case "date": {
          dataValue = new Date(dataValue);
          break;
        }
        default: {
          dataValue = parseInt(dataValue);
          break;
        }
      }

      constructingObject[heading] = dataValue;
    });

    output.push(constructingObject);
  }
});
console.log('done');
let atmospheric_pressure = JSON.parse(pressure)
let table = { 10: 0, 20: 0, 30: 0, 40: 0, 50: 0, 60: 0, 70: 0, 80: 0, 90: 0 }

let current_time = 'none'
let list = []
//start of first table
for (let i = 0; i < output.length; i++) {
  if (!(output[i].zenith == '-999' && output[i].azimuth == '-999')) {
    list.push({ timestamp: output[i].timestamp, zenith: output[i].zenith })
  }
}
print(list)

function print(data) {
  console.log('Time', '\t', 'Pressure', '\t', '0-10', '\t', '10-20', '\t', '20-30', '\t', '30-40', '\t', '40-50', '\t', '50-60', '\t', '60-70', '\t', '70-80', '\t', '80-90', '\r')
  for (let k = 0; k < data.length; k++) {
    let iternation = 0;
    if (current_time === 'none') {
      current_time = data[k].timestamp
    } else {
      if (data[k].timestamp < current_time + 3600) {
        if (-1 < data[k].zenith && data[k].zenith < 11) {
          table['10'] += 1
        } else if (10 <= data[k].zenith && data[k].zenith < 21) {
          table['20'] += 1
        } else if (20 <= data[k].zenith && data[k].zenith < 31) {
          table['30'] += 1
        } else if (30 <= data[k].zenith && data[k].zenith < 41) {
          table['40'] += 1
        } else if (40 <= data[k].zenith && data[k].zenith < 51) {
          table['50'] += 1
        } else if (50 <= data[k].zenith && data[k].zenith < 61) {
          table['60'] += 1
        } else if (60 <= data[k].zenith && data[k].zenith < 71) {
          table['70'] += 1
        } else if (70 <= data[k].zenith && data[k].zenith < 81) {
          table['80'] += 1
        } else if (80 <= data[k].zenith && data[k].zenith < 91) {
          table['90'] += 1
        }

      } else {
        //console.log(atmospheric_pressure)
        let goal = data[k].timestamp
        let times = []
        for(let y = 0;atmospheric_pressure.length>y;y++){
          times.push(atmospheric_pressure[y].timestamp)
        }
        console.log(JSON.stringify(times))
        var closest = times.reduce(function(prev, curr) {
          return (Math.abs(curr - goal) < Math.abs(prev - goal) ? curr : prev);
        });
        let pressure2 = atmospheric_pressure[times.indexOf(closest)].pressure
        var date = new Date(data[k].timestamp * 1000);
        var minutes = "0" + date.getMinutes();
        var hours = date.getHours();
        var seconds = "0" + date.getSeconds();
        var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
        console.log(formattedTime, '\t', pressure2, '\t', table['10'], '\t', table['20'], '\t', table['30'], '\t', table['40'], '\t', table['50'], '\t', table['60'], '\t', table['70'], '\t', table['80'], '\t', table['90'], '\r')
        current_time = data[k].timestamp
        table = { 10: 0, 20: 0, 30: 0, 40: 0, 50: 0, 60: 0, 70: 0, 80: 0, 90: 0 }
      }
    }
  }
}
//console.log(table)

/*
for (let i = 0; i < output.length; i++) {
    let iternation = 0;
    if (!(output[i].zenith == '-999')) {
        let sin = Math.cos((output[i].zenith/180)*Math.PI)
        while (true) {
            if (atmospheric_pressure.hasOwnProperty(output[i - iternation].timestamp)) {
                var date = new Date(output[i - iternation].timestamp * 1000);
                var minutes = "0" + date.getMinutes();
                var hours = date.getHours();
                var seconds = "0" + date.getSeconds();
                var formattedTime = hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
                let result = atmospheric_pressure[output[i - iternation].timestamp] / sin
                if (result < 0) {
                    result *= -1
                }
                console.log(formattedTime + '\t' + result + '\t' + output[i].zenith + '\t' + atmospheric_pressure[output[i - iternation].timestamp] + '\n')
                break
            } else {
                iternation++
            }
        }
    }
}
*/
/*
let json = {}
let newoutput = []
output.forEach(item => {
  json[item.timestamp] = item.atmospheric_pressure
})
newoutput = JSON.stringify(json)

fs.writeFile('json2.json', newoutput, function(err) {
  if (err) throw err;
  console.log('Saved!');
});
*/
