module.exports = {
  apps: [
    {
      name: "auth",
      script: "./index.js",
      cwd: "./services/auth",
      namespace: "story-maker-admin",
      watch: false,
      exec_mode: "fork",
      env: { NODE_ENV: "development", PORT: 5000 },
    },
    {
      name: "user",
      script: "./index.js",
      cwd: "./services/user",
      namespace: "story-maker-admin",
      watch: false,
      exec_mode: "fork",
      env: { NODE_ENV: "development", PORT: 5001 },
    },
    {
      name: "assets",
      script: "./index.js",
      cwd: "./services/assets",
      namespace: "story-maker-admin",
      watch: false,
      exec_mode: "fork",
      env: { NODE_ENV: "development", PORT: 5002 },
    },
    {
      name: "billing-subscription",
      script: "./index.js",
      cwd: "./services/billing-subscription",
      namespace: "story-maker-admin",
      watch: false,
      exec_mode: "fork",
      env: { NODE_ENV: "development", PORT: 5008 },
    },
    {
      name: "notification",
      script: "./index.js",
      cwd: "./services/notification",
      namespace: "story-maker-admin",
      watch: false,
      exec_mode: "fork",
      env: { NODE_ENV: "development", PORT: 5009 }
    }
  ],
};
