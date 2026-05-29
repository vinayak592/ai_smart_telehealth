const { spawn } = require('child_process');
const path = require('path');

console.log('Starting Aura Health Telehealth Platform...');

// Spawn Backend
const backend = spawn('npm', ['start'], {
  cwd: path.join(__dirname, 'telehealth-backend'),
  shell: true,
  stdio: 'inherit'
});

// Spawn Frontend
const frontend = spawn('npm', ['run', 'dev'], {
  cwd: path.join(__dirname, 'frontend'),
  shell: true,
  stdio: 'inherit'
});

backend.on('error', (err) => {
  console.error('Failed to start backend:', err);
});

frontend.on('error', (err) => {
  console.error('Failed to start frontend:', err);
});

process.on('SIGINT', () => {
  backend.kill();
  frontend.kill();
  process.exit();
});
