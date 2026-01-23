const { app } = require('electron')
console.log('-------------------------------------------')
console.log('DEBUG CHECK: Running minimal script')
console.log('electron module type:', typeof require('electron'))
console.log('app object:', app)
console.log('-------------------------------------------')

if (app) {
  app.whenReady().then(() => {
    console.log('App is ready! Exiting...')
    app.quit()
  })
} else {
  console.error('FAILURE: app is undefined')
  process.exit(1)
}
