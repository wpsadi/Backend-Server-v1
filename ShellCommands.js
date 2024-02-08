import {exec} from "child_process"

// Replace 'ls' with the command you want to run
let test = ()=>exec('dir', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error executing command: ${error}`);
    return;
  }
  if (stderr) {
    console.error(`Command stderr: ${stderr}`);
    return;
  }
  console.log(`Command output: ${stdout}`);
});

export default test
