# Tiltfile for local development with Kubernetes
# This orchestrates building Docker images and deploying Helm charts

# Allow k8s contexts (adjust if needed)
allow_k8s_contexts('k3d-task-app-cluster')

# Local registry for faster image pushes
default_registry('localhost:5000')

# Backend
docker_build(
    'task-backend',
    './backend',
    dockerfile='./backend/Dockerfile',
    live_update=[
        sync('./backend', '/app'),
        run('cd /app && go build -o main .', trigger=['./backend/**/*.go']),
    ],
)

# Frontend
docker_build(
    'task-frontend',
    './frontend',
    dockerfile='./frontend/Dockerfile',
    live_update=[
        sync('./frontend/src', '/app/src'),
        run('cd /app && npm run build', trigger=['./frontend/src/**/*']),
    ],
)

# Deploy Helm chart
k8s_yaml(helm(
    './helm/task-app',
    name='task-app',
    namespace='app',
    values=['./helm/task-app/values.yaml'],
    set=[
        'backend.image.repository=task-backend',
        'backend.image.tag=latest',
        'frontend.image.repository=task-frontend',
        'frontend.image.tag=latest',
    ],
))

# Create namespace
k8s_yaml("""
apiVersion: v1
kind: Namespace
metadata:
  name: app
""")

# Port forwards for easy access
k8s_resource(
    'task-app-backend',
    port_forwards=['3000:3000'],
    labels=['backend'],
)

k8s_resource(
    'task-app-frontend',
    port_forwards=['8080:80'],
    labels=['frontend'],
)

k8s_resource(
    'task-app-postgresql',
    labels=['database'],
)

# Resource dependencies
k8s_resource(
    'task-app-backend',
    resource_deps=['task-app-postgresql'],
)

k8s_resource(
    'task-app-frontend',
    resource_deps=['task-app-backend'],
)

# Port forward to ArgoCD (if installed)
k8s_resource(
    workload='argocd-server',
    new_name='argocd',
    port_forwards=['8081:8080'],
    labels=['argocd'],
    resource_deps=[],
    auto_init=False,
    trigger_mode=TRIGGER_MODE_MANUAL,
)

# Port forward to Grafana (if installed)
k8s_resource(
    workload='prometheus-grafana',
    new_name='grafana',
    port_forwards=['3001:3000'],
    labels=['monitoring'],
    resource_deps=[],
    auto_init=False,
    trigger_mode=TRIGGER_MODE_MANUAL,
)

# Port forward to Prometheus (if installed)
k8s_resource(
    workload='prometheus-kube-prometheus-prometheus',
    new_name='prometheus',
    port_forwards=['9090:9090'],
    labels=['monitoring'],
    resource_deps=[],
    auto_init=False,
    trigger_mode=TRIGGER_MODE_MANUAL,
)

# Display helpful information
print("""
╔═══════════════════════════════════════════════════════════╗
║          Task Management App - Local Development          ║
╠═══════════════════════════════════════════════════════════╣
║  APPLICATION:                                             ║
║    Frontend:    http://localhost:8080                     ║
║    Backend API: http://localhost:3000                     ║
║    Metrics:     http://localhost:3000/metrics             ║
║    Health:      http://localhost:3000/health              ║
║                                                           ║
║  MONITORING (if installed):                               ║
║    ArgoCD:      http://localhost:8081                     ║
║    Grafana:     http://localhost:3001                     ║
║    Prometheus:  http://localhost:9090                     ║
║                                                           ║
║  💡 Tip: Enable monitoring services in Tilt UI            ║
╚═══════════════════════════════════════════════════════════╝
""")
