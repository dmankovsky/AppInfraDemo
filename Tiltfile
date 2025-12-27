
allow_k8s_contexts('k3d-task-app-cluster')

# Create cluster
local_resource(
    'cluster',
    cmd='ctlptl apply -f cluster/cluster.yaml',
    deps=['cluster/cluster.yaml'],
    labels=['infrastructure'],
)

# Add helm repos
local_resource(
    'helm-repos',
    cmd='''
        helm repo add prometheus-community https://prometheus-community.github.io/helm-charts 2>/dev/null || true
        helm repo add argo https://argoproj.github.io/argo-helm 2>/dev/null || true
        helm repo add bitnami https://charts.bitnami.com/bitnami 2>/dev/null || true
        helm repo update
    ''',
    resource_deps=['cluster'],
    labels=['infrastructure'],
)

# Install ArgoCD
local_resource(
    'argocd',
    cmd='''
        kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
        helm upgrade --install argocd argo/argo-cd \
            -n argocd \
            -f helm/argocd/values-argocd.yaml \
            --wait --timeout 5m
    ''',
    deps=['helm/argocd/values-argocd.yaml'],
    resource_deps=['helm-repos'],
    labels=['infrastructure'],
)

# Install Prometheus/GrafanaHelm
# local_resource(
#     'monitoring',
#     cmd='''
#         kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -
#         helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
#             -n monitoring \
#             -f helm/monitoring/values-prometheus.yaml \
#             --wait --timeout 5m
#     ''',
#     deps=['helm/monitoring/values-prometheus.yaml'],
#     resource_deps=['helm-repos'],
#     labels=['infrastructure'],
# )

# Display help
print("""
Info:
ArgoCD UI: http://localhost:8081 (run 'make port-forward-argocd' in another terminal)
Username: admin                                          
Password: make get-argocd-password
""")
