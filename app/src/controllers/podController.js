const { exec } = require('child_process');
const fs = require('fs');

exports.createPod = (req, res) => {
    const { envName, image, cpuRequest, memoryRequest, cpuLimit, memoryLimit } = req.body;

    // Create the pod manifest
    const podManifest = {
        apiVersion: 'v1',
        kind: 'Pod',
        metadata: {
            name: envName
        },
        spec: {
            containers: [{
                name: envName,
                image: image,
                resources: {
                    requests: {
                        cpu: cpuRequest,
                        memory: memoryRequest
                    },
                    limits: {
                        cpu: cpuLimit,
                        memory: memoryLimit
                    }
                },
                ports: [{
                    containerPort: 3000
                }]
            }]
        }
    };

    // Write the pod manifest to a temporary file
    const podManifestFile = `/tmp/${envName}-pod.yml`;
    fs.writeFileSync(podManifestFile, JSON.stringify(podManifest, null, 2));

    // Apply the pod manifest using kubectl
    const command = `kubectl apply -f ${podManifestFile}`;
    exec(command, (error, stdout, stderr) => {
        if (error) {
            console.error(`Error executing command: ${error.message}`);
            return res.send(`<div style="color: red;">Failed to create the pod: ${error.message}</div>`);
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return res.send(`<div style="color: red;">Error occurred during pod creation: ${stderr}</div>`);
        }

        console.log(`stdout: ${stdout}`);
        return res.send(`<div style="color: green;">Pod created successfully</div>`);
    });
};
