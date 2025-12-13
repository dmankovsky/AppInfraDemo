#!/bin/bash
set -e

echo "Setting up Task Management App Infrastructure..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if required tools are installed
echo -e "${BLUE}Checking prerequisites...${NC}"

command -v docker >/dev/null 2>&1 || { echo "❌ Docker is required but not installed. Aborting." >&2; exit 1; }

# Install kubectl if not present
if ! command -v kubectl >/dev/null 2>&1; then
    echo -e "${YELLOW}Installing kubectl...${NC}"
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/darwin/$(uname -m)/kubectl"
        chmod +x kubectl
        sudo mv kubectl /usr/local/bin/
    else
        # Linux
        curl -LO "https://dl.k8s.io/release/$(curl -L -s https://dl.k8s.io/release/stable.txt)/bin/linux/amd64/kubectl"
        chmod +x kubectl
        sudo mv kubectl /usr/local/bin/
    fi
fi

# Install Helm if not present
if ! command -v helm >/dev/null 2>&1; then
    echo -e "${YELLOW}Installing Helm...${NC}"
    curl -fsSL https://raw.githubusercontent.com/helm/helm/main/scripts/get-helm-3 | bash
fi


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
