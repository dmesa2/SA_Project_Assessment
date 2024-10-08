#!/bin/bash

# Create monitoring namespace if it doesn't exist
kubectl create namespace monitoring

# Add Helm repositories
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

# Install Prometheus in the monitoring namespace
helm install prometheus prometheus-community/kube-prometheus-stack --namespace monitoring

# Install Grafana in the monitoring namespace with admin password set to 'admin'
helm install grafana grafana/grafana \
  --set adminPassword='admin' \
  --namespace monitoring

# Expose Grafana via NodePort in the monitoring namespace
kubectl expose service grafana --type=NodePort --target-port=3000 --name=grafana-nodeport --namespace monitoring

# Get the NodePort for Grafana service in the monitoring namespace
kubectl get svc grafana-nodeport --namespace monitoring

# Display message with Grafana access information
NODE_PORT=$(kubectl get svc grafana-nodeport --namespace monitoring -o=jsonpath='{.spec.ports[0].nodePort}')
NODE_IP=$(kubectl get nodes -o=jsonpath='{.items[0].status.addresses[?(@.type=="InternalIP")].address}')
echo "Grafana is accessible via http://localhost:$NODE_PORT with username 'admin' and password 'admin'"
