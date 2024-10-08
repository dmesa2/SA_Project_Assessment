const { exec } = require('child_process');
const fs = require('fs');

exports.createPod = (req, res) => {
    const { teamLabel, envName, image, cpuRequest, memoryRequest, cpuLimit, memoryLimit } = req.body;

    // Create the pod manifest with soft node affinity (preferredDuringScheduling)
    const podManifest = {
        apiVersion: 'v1',
        kind: 'Pod',
        metadata: {
            name: envName,
            labels: {
                team: teamLabel
            }
        },
        spec: {
            affinity: {
                nodeAffinity: {
                    preferredDuringSchedulingIgnoredDuringExecution: [
                        {
                            weight: 1, // Weight can be between 1 and 100 (higher is more preferred)
                            preference: {
                                matchExpressions: [
                                    {
                                        key: "team",
                                        operator: "In",
                                        values: [teamLabel]
                                    }
                                ]
                            }
                        }
                    ]
                }
            },
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
            return res.status(500).send('Failed to create the pod');
        }
        if (stderr) {
            console.error(`stderr: ${stderr}`);
            return res.status(500).send('Error occurred during pod creation');
        }

        console.log(`stdout: ${stdout}`);
        return res.send(`<div style="color: green;">Pod created successfully</div>`);
    });
};
