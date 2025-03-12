 module.exports = {
    apps: [{
      name: 'airporttransferhub',
      script: '/home/ubuntu/airporttransferhub/server/server.mjs', 
      env: {
            PM2: "true"
      }
    }]
};