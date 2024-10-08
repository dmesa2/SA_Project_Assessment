# SA Project Assessment (Launch Dev Environments)

This project provides employees with the ability to launch multiple development environments using Kubernetes. The solution includes:

- **Web UI for Pod Creation**: A web interface allows users to specify the base image, packages, and resource requests (CPU/Memory/GPU) for launching environments as Kubernetes pods.
- **GitHub CI/CD Integration**: GitHub Actions handle continuous integration and deployment. Each change to the code triggers Docker image creation and deployment to Docker Hub.
- **Docker Image Creation**: The environments are built as Docker images, which can be customized based on the selected base image and requirements.
- **Deployment to Kubernetes**: Docker images are deployed as Kubernetes pods with the requested resources.
- **Monitoring with Grafana**: Grafana is set up to monitor pod resource usage, tracking CPU and memory requested vs used.
- **SSH**: Each deployed environment allows for SSH access via an SSH sidecar deployed in each environment pod.
- **Autoscaling and Monitoring**: The cluster can autoscale based on resource utilization, ensuring idle or underutilized resources are downscaled as necessary.

---

## Features and File Locations

### 1. **Web UI for Pod Creation**

- Allows users to select the base image (from docker hub) and request specific CPU/memory allocations.
- **Files**:
  - `app/src/views/index.ejs`: Web UI for pod creation.
  - `app/src/controllers/podController.js`: Controller for handling pod creation requests.
  - `app/src/routes/podRoutes.js`: Routes to handle pod-related requests.

### 2. **GitHub CI/CD Integration**

- GitHub Actions automatically trigger Docker builds and deployments on push.
- **Files**:
  - `.github/workflows`: (Configure your GitHub Actions here to handle CI/CD).
  - `app/Dockerfile`: Dockerfile for building environments.

### 3. **Docker Image Creation**

- A Dockerfile defines the kubectl_ui that is deployed to kubernetes and then manages kubernetes via a web interface that employees can use.
- **Files**:
  - `app/Dockerfile`: Docker configuration for kubectl_ui.

### 4. **Deployment to Kubernetes**

- kubectl_ui is packaged via helm and deployed seamlessly.
- **Files**:
  - `helm/templates/deployment.yml`: Defines pod deployment configuration in Kubernetes.
  - `helm/templates/serviceaccount.yml`: Provides admin privileges to the kubectl_ui pod.
  - `helm/templates/service.yml`: Kubernetes service configuration for exposing the pods.

### 5. **Monitoring with Grafana**

- Grafana dashboards track CPU and memory usage for all running environments.
- **Files**:
  - `grafana/dashboards/dashboard.json`: Grafana dashboard configuration.
  - `grafana/startup.sh`: Script to set up and start Grafana monitoring.
  - `grafana/shutdown.sh`: Script to stop and clean up Grafana.

### 6. **SSH Access**

- Pods are configured for SSH access.
- **Files**:
  - `app/src/controllers/podController.js`: A ssh-sidecar is created with each environment pod that the user spins up.

### 7. **Autoscaling and Monitoring**

- Kubernetes Horizontal Pod Autoscaler (HPA) automatically scales pods based on CPU/memory usage.
- **Files**:
  - `helm/templates/hpa.yml`: HPA configuration for autoscaling based on resource utilization.

---

## Monitoring Resource Usage

1. **CPU Usage Query**:
   - Query:
   ```
   sum(rate(container_cpu_usage_seconds_total{namespace=~"$namespace", pod=~"$pod"}[$__rate_interval])) by (pod) /
   sum(kube_pod_container_resource_requests{namespace=~"$namespace", pod=~"$pod", resource="cpu"}) by (pod) * 100
   ```
2. **Memory Usage Query**:
   - Query:
   ```
   sum(container_memory_working_set_bytes{namespace=~"$namespace", pod=~"$pod"}) by (pod) /
   sum(kube_pod_container_resource_requests{namespace=~"$namespace", pod=~"$pod", resource="memory"}) by (pod) * 100
   ```

---

### Notes:

- All **Helm** charts for Kubernetes deployment of **kubectl_ui** are located in `helm/`.

This setup allows for efficient development environment management with full resource monitoring, automatic scaling, and seamless CI/CD integration.

---

## Setup Instructions:

1. Clone the repository:

   ```bash
   git clone git@github.com:dmesa2/SA_Project_Assessment.git
   ```

2. In the root directory of the project, install the kubectl-ui via Helm:

   ```bash
   helm install kubectl-ui ./helm
   ```

3. Navigate to the `grafana` directory and run the startup script:

   ```bash
   cd grafana
   ./startup.sh
   ```

4. Access the Grafana dashboard using the URL provided in the stdout (e.g., `http://localhost:<port>`). Sign in with:

   - Username: `admin`
   - Password: `admin`

5. Set the Prometheus data source using the connection string:

   ```text
   http://prometheus-kube-prometheus-prometheus.monitoring.svc.cluster.local:9090
   ```

6. Import the Grafana dashboard by uploading the file located at:

   ```bash
   <root_project>/grafana/dashboards/dashboard.json
   ```

7. Open the web interface at `http://localhost:30080` to spin up the development environments. Use the form to specify resources, and check the created pod in the Grafana dashboard.

## Video Demonstration of the Project

[Video Demonstration](https://youtu.be/2UJ5vjCnkJU)
