import cron from 'node-cron'

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


module.exports = cron
