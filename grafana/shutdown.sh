#!/bin/bash

# Uninstall Prometheus and Grafana from the monitoring namespace
helm uninstall prometheus --namespace monitoring
helm uninstall grafana --namespace monitoring

# Delete the Grafana NodePort service in the monitoring namespace (just in case it's still running)
kubectl delete svc grafana-nodeport --namespace monitoring

# Delete the monitoring namespace
kubectl delete namespace monitoring
