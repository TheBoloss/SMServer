module.exports = {
  apps: [{
    name: "smserver",
    script: "./dist/server.js",
    watch: false,
    env: {
      "NODE_ENV": "production"
    },
    // Ensure the app is rebuilt before starting
    exec_mode: "fork",
    instances: 1,
    autorestart: true,
    max_restarts: 10,
    // Add timestamp to logs
    time: true
  }]
}