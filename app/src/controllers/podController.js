const { exec } = require('child_process');

exports.createPod = (req, res) => {
    const { image, cpuRequest, memoryRequest, cpuLimit, memoryLimit } = req.body;

    // Build the kubectl run command
    const command = `kubectl run my-pod --image=${image} --requests=cpu=${cpuRequest},memory=${memoryRequest} --limits=cpu=${cpuLimit},memory=${memoryLimit}`;

    // Execute the command
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${error.message}`);
            return res.status(500).send('Failed to create the pod');
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return res.status(500).send('Error occurred during pod creation');
        }
        console.log(`stdout: ${stdout}`);
        return res.send('Pod created successfully');
    });
};
