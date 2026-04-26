module.exports = {
  apps: [{
    name: "fixnow-api",
    script: "./server.js",
    instances: "max",
    exec_mode: "cluster",
    env: {
      NODE_ENV: "development",
    },
    env_production: {
      NODE_ENV: "production",
    }
  }]
}
