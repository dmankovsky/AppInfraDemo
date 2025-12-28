allow_k8s_contexts('k3d-task-app-cluster')

# Create cluster
local_resource(
    'cluster',
    cmd='ctlptl apply -f cluster/cluster.yaml',
    deps=['cluster/cluster.yaml'],
    labels=['infra'],
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
    labels=['infra'],
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
    labels=['infra'],
)

# Port forward to ArgoCD
local_resource(
    'argocd-port-forward',
    serve_cmd='kubectl port-forward -n argocd svc/argocd-server 8081:443',
    resource_deps=['argocd'],
    labels=['access'],
)

# Build backend Docker image
docker_build(
    'task-backend',
    './backend',
    dockerfile='./backend/Dockerfile',
    live_update=[
        sync('./backend', '/app'),
        run('cd /app && go build -o main .', trigger=['./backend/**/*.go']),
    ],
)

# Deploy backend
k8s_yaml([
    'backend/k8s/namespace.yaml',
    'backend/k8s/deployment.yaml',
    'backend/k8s/service.yaml',
])

# Port forward to backend
k8s_resource(
    'task-backend',
    port_forwards=['3000:3000'],
    labels=['app'],
)

# Build frontend Docker image
docker_build(
    'task-frontend',
    './frontend',
    dockerfile='./frontend/Dockerfile',
    live_update=[
        sync('./frontend/src', '/app/src'),
        run('cd /app && npm run build', trigger=['./frontend/src/**/*']),
    ],
)

# Deploy frontend
k8s_yaml([
    'frontend/k8s/deployment.yaml',
    'frontend/k8s/service.yaml',
])

# Port forward to frontend
k8s_resource(
    'task-frontend',
    port_forwards=['8080:80'],
    labels=['app'],
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
Frontend: http://localhost:8080 (auto port-forwarded)

Backend API: http://localhost:3000 (auto port-forwarded)
  - Health: http://localhost:3000/health
  - Metrics: http://localhost:3000/metrics
  - API: http://localhost:3000/api/tasks

ArgoCD UI: http://localhost:8081 (auto port-forwarded)
  - Username: admin                                          
  - Password: make get-argocd-password
""")
