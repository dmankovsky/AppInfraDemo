#!/bin/bash
set -e

echo "🚀 Setting up Task Management App Infrastructure..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required tools are installed
echo -e "${BLUE}Checking prerequisites...${NC}"

command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed. Aborting." >&2; exit 1; }
command -v kubectl >/dev/null 2>&1 || { echo "❌ kubectl is required but not installed. Aborting." >&2; exit 1; }
command -v helm >/dev/null 2>&1 || { echo "❌ Helm is required but not installed. Aborting." >&2; exit 1; }

# Install k3d if not present
if ! command -v k3d >/dev/null 2>&1; then
    echo -e "${YELLOW}Installing k3d...${NC}"
    curl -s https://raw.githubusercontent.com/k3d-io/k3d/main/install.sh | bash
fi

# Install ctlptl if not present
if ! command -v ctlptl >/dev/null 2>&1; then
    echo -e "${YELLOW}Installing ctlptl...${NC}"
    CTLPTL_VERSION="0.8.25"
    curl -fsSL https://github.com/tilt-dev/ctlptl/releases/download/v${CTLPTL_VERSION}/ctlptl.${CTLPTL_VERSION}.$(uname -s)-$(uname -m).tar.gz | \
        sudo tar -xzv -C /usr/local/bin ctlptl
fi

# Install tilt if not present
if ! command -v tilt >/dev/null 2>&1; then
    echo -e "${YELLOW}Installing Tilt...${NC}"
    curl -fsSL https://raw.githubusercontent.com/tilt-dev/tilt/master/scripts/install.sh | bash
fi

echo -e "${GREEN}✓ All prerequisites installed${NC}"

# Create cluster using ctlptl
echo -e "${BLUE}Creating Kubernetes cluster...${NC}"
ctlptl apply -f cluster/cluster.yaml

# Wait for cluster to be ready
echo -e "${BLUE}Waiting for cluster to be ready...${NC}"
kubectl wait --for=condition=Ready nodes --all --timeout=120s

echo -e "${GREEN}✓ Cluster is ready${NC}"

# Add Helm repositories
echo -e "${BLUE}Adding Helm repositories...${NC}"
helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
helm repo add argo https://argoproj.github.io/argo-helm
helm repo add bitnami https://charts.bitnami.com/bitnami
helm repo update

echo -e "${GREEN}✓ Helm repositories added${NC}"

# Install Prometheus Operator
echo -e "${BLUE}Installing Prometheus Operator...${NC}"
kubectl create namespace monitoring --dry-run=client -o yaml | kubectl apply -f -
helm upgrade --install prometheus prometheus-community/kube-prometheus-stack \
    -n monitoring \
    -f helm/monitoring/values-prometheus.yaml \
    --wait \
    --timeout 5m

echo -e "${GREEN}✓ Prometheus Operator installed${NC}"

# Install ArgoCD
echo -e "${BLUE}Installing ArgoCD...${NC}"
kubectl create namespace argocd --dry-run=client -o yaml | kubectl apply -f -
helm upgrade --install argocd argo/argo-cd \
    -n argocd \
    -f helm/argocd/values-argocd.yaml \
    --wait \
    --timeout 5m

echo -e "${GREEN}✓ ArgoCD installed${NC}"

# Get ArgoCD admin password
echo -e "${BLUE}Getting ArgoCD admin password...${NC}"
ARGOCD_PASSWORD=$(kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d)

echo ""
echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║          Setup Complete! 🎉                                ║${NC}"
echo -e "${GREEN}╠═══════════════════════════════════════════════════════════╣${NC}"
echo -e "${GREEN}║  Next steps:                                              ║${NC}"
echo -e "${GREEN}║  1. Run 'tilt up' to start local development             ║${NC}"
echo -e "${GREEN}║  2. Access Tilt UI at http://localhost:10350             ║${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}║  ArgoCD:                                                  ║${NC}"
echo -e "${GREEN}║    URL: http://localhost:8081                             ║${NC}"
echo -e "${GREEN}║    Username: admin                                        ║${NC}"
echo -e "${GREEN}║    Password: ${ARGOCD_PASSWORD}                           ║${NC}"
echo -e "${GREEN}║                                                           ║${NC}"
echo -e "${GREEN}║  Grafana:                                                 ║${NC}"
echo -e "${GREEN}║    URL: http://grafana.local                              ║${NC}"
echo -e "${GREEN}║    Username: admin                                        ║${NC}"
echo -e "${GREEN}║    Password: admin                                        ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""
