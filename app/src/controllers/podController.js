const { exec } = require('child_process');
const fs = require('fs');

exports.createPod = (req, res) => {
    const { teamLabel, envName, image, cpuRequest, memoryRequest, cpuLimit, memoryLimit } = req.body;

    // Create the pod manifest with the environment container and the SSH container
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
            containers: [
                {
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
                },
                {
                    name: 'ssh-sidecar',
                    image: 'rastasheep/ubuntu-sshd:18.04',  // Example SSHD image
                    ports: [{
                        containerPort: 22  // Expose SSH on port 22
                    }],
                    env: [
                        {
                            name: 'ROOT_PASSWORD',
                            value: 'yourpassword'  // For testing, use key-based auth in production
                        }
                    ]
                }
            ]
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
        
        // After the pod is created, create the NodePort service for SSH
        const nodePort = 30000 + Math.floor(Math.random() * 1000);  // Random NodePort
        const serviceManifest = {
            apiVersion: 'v1',
            kind: 'Service',
            metadata: {
                name: `${envName}-ssh-service`
            },
            spec: {
                selector: {
                    app: envName  // Ensure this matches the pod's labels
                },
                ports: [
                    {
                        protocol: 'TCP',
                        port: 22,           // SSH port in the container
                        targetPort: 22,     // Target container port
                        nodePort: nodePort  // NodePort
                    }
                ],
                type: 'NodePort'
            }
        };

        const serviceManifestFile = `/tmp/${envName}-service.yml`;
        fs.writeFileSync(serviceManifestFile, JSON.stringify(serviceManifest, null, 2));

        // Apply the service manifest using kubectl
        const serviceCommand = `kubectl apply -f ${serviceManifestFile}`;
        exec(serviceCommand, (serviceError, serviceStdout, serviceStderr) => {
            if (serviceError) {
                console.error(`Error creating service: ${serviceError.message}`);
                return res.status(500).send('Failed to create the SSH service');
            }
            if (serviceStderr) {
                console.error(`stderr: ${serviceStderr}`);
                return res.status(500).send('Error occurred during SSH service creation');
            }

            console.log(`Service created successfully: ${serviceStdout}`);
            
            // Get the pod IP
            const getPodIPCommand = `kubectl get pod ${envName} -o jsonpath='{.status.podIP}'`;
            exec(getPodIPCommand, (podIPError, podIPStdout, podIPStderr) => {
                if (podIPError) {
                    console.error(`Error getting pod IP: ${podIPError.message}`);
                    return res.status(500).send('Failed to get pod IP');
                }

                const podIP = podIPStdout.trim();
                const sshCommandNodePort = `ssh root@localhost -p ${nodePort}`;
                const sshCommandPodIP = `ssh root@${podIP} -p 22`;

                return res.send(`<div style="color: green;">Pod and SSH service created successfully.<br>
                Use the following SSH commands:<br>
                <strong>From outside the cluster (via NodePort):</strong> <code>${sshCommandNodePort}</code><br>
                <strong>From inside the cluster (via Pod IP):</strong> <code>${sshCommandPodIP}</code></div>`);
            });
        });
    });
};
