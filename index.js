const googlehome = require('google-home-notifier');
const SerialPort = require('serialport');

// setup seiarl port
const port = new SerialPort(process.env.TWELITE_PORT, {
  baudRate: 115200,
})

// setup google home
googlehome.device(process.env.GOOGLE_HOME_NAME, 'ja')
googlehome.ip(process.env.GOOGLE_HOME_IP)
 

port.on('open', () => {
  console.log('port opened')
})

port.on('error', err => {
  console.log('Error: ', err.message);
})

let buffer = ""
port.on('data', data => {
  for (const k of data.keys()) {
    const s = data.toString('utf8', k, k + 1)
    if (s == '\r' || s == '\n') {
      if (buffer !== "") {
        handleTweliteLine(buffer)
        buffer = ""
      }
    } else {
      buffer = buffer + s
    }
  }
})

let lastState // 0: Google Home is on the sensor, 1: not
function handleTweliteLine(line) {
  if (line.length != 49 || line.indexOf(':') != 0) {
    console.error(`invalid line: ${line}`)
    return
  }
  const state = line.charAt(34) == '1' ? 1 : 0
  if (lastState != state) {
    console.log('state changed', state)
  }
  if (lastState == 0 && state == 1) {
    console.log('盗まれた！')
    googlehome.notify('助けてーー！！盗まれるーーーーーーー！！', (res) => {
      console.log(res)
    })
  }
  lastState = state
}
