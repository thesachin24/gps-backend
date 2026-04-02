import cron from 'node-cron'
import { persistGpsLbsLocation } from '../service'

// cron.schedule('*/10 * 0-1 * * 2-5', async () => {
// },{
//   scheduled: true,
//   timezone: "Asia/Kolkata"
// })

// //At 02:03 AM
// cron.schedule('3 2 * * *', async () => {
// },{
//   scheduled: true,
//   timezone: "Asia/Kolkata"
// })

// Every minute - After 24 Hours of Availing Business Subscription
// cron.schedule('*/1 * * * *', async () => {
//   console.log('Cron job started');
// }, {
//   scheduled: true,
//   timezone: "Asia/Kolkata"
// })

// persistGpsLbsLocation({
//   deviceId: '1234567890',
//   parsed: {
//     device_type: 'GPS_TRACKER',
//     protocol: 'gps_lbs',
//     latitude: 12.9716,
//     longitude: 77.5946,
//     speed: 10,
//     heading: 10,
//     timestamp: new Date().toISOString()
//   },
//   transport: 'tcp'
// })

module.exports = cron
