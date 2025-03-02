const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

// Get the absolute path to the backend directory
const backendDir = path.resolve(__dirname, '../backend');

// Check if the virtual environment exists
const venvPath = path.join(backendDir, 'venv');
const venvExists = fs.existsSync(venvPath);

if (!venvExists) {
  console.error(`Virtual environment not found at ${venvPath}`);
  process.exit(1);
}

// Get the Python executable from the virtual environment
const pythonPath = process.platform === 'win32'
  ? path.join(venvPath, 'Scripts', 'python.exe')
  : path.join(venvPath, 'bin', 'python');

// Check if the Python executable exists
if (!fs.existsSync(pythonPath)) {
  console.error(`Python executable not found at ${pythonPath}`);
  process.exit(1);
}

console.log(`Starting backend with Python from: ${pythonPath}`);

// Spawn the process using the Python from the virtual environment
const backend = spawn(pythonPath, [path.join(backendDir, 'start.py')], { 
  stdio: 'inherit',
  cwd: backendDir
});

// Handle process exit
backend.on('close', (code) => {
  console.log(`Backend process exited with code ${code}`);
});

// Handle process errors
backend.on('error', (err) => {
  console.error('Failed to start backend process:', err);
}); 