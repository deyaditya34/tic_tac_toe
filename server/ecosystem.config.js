module.exports = {
  apps: [
    {
      name: 'tic_tac_toe_server',
      script: 'npm',
      args: 'start',
      instances: 4,
      exec_mode: 'cluster',
      increment_var: 'SERVER_PORT',
      env: {
        SERVER_PORT: 8080,
      },
    },
  ],
};
