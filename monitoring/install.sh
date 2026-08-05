#!/bin/bash
set -euo pipefail

NAMESPACE=monitoring

echo "=== Installing kube-prometheus-stack ==="
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add grafana https://grafana.github.io/helm-charts
helm repo update

helm upgrade --install monitoring prometheus-community/kube-prometheus-stack \
  -f monitoring/prometheus/kube-prometheus-values.yaml \
  -n $NAMESPACE --create-namespace --wait

echo "=== Installing Loki + Promtail ==="
helm upgrade --install loki grafana/loki-stack \
  -f monitoring/loki/loki-stack-values.yaml \
  -n $NAMESPACE --wait

echo "=== Installing Tempo ==="
helm upgrade --install tempo grafana/tempo \
  -f monitoring/tempo/tempo-values.yaml \
  -n $NAMESPACE --wait

echo "=== Installing OTel Collector ==="
kubectl apply -f monitoring/otel/otel-collector.yaml

echo "=== Applying alerting rules ==="
kubectl apply -f monitoring/prometheus/rules/

echo "=== Applying ServiceMonitors ==="
kubectl apply -f monitoring/prometheus/servicemonitor-java.yaml
kubectl apply -f monitoring/prometheus/servicemonitor-node.yaml
kubectl apply -f monitoring/prometheus/servicemonitor-python.yaml

echo ""
echo "=== Done ==="
echo "Grafana     : kubectl port-forward svc/monitoring-grafana 3000:80 -n $NAMESPACE"
echo "Prometheus  : kubectl port-forward svc/monitoring-kube-prometheus-prometheus 9090:9090 -n $NAMESPACE"
echo "Alertmanager: kubectl port-forward svc/monitoring-kube-prometheus-alertmanager 9093:9093 -n $NAMESPACE"
