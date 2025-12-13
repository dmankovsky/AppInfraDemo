#!/bin/bash
set -e

echo "🧹 Cleaning up Task Management App Infrastructure..."

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Delete the cluster
echo -e "${BLUE}Deleting Kubernetes cluster...${NC}"
ctlptl delete cluster task-app-cluster || k3d cluster delete task-app-cluster

# Delete the registry
echo -e "${BLUE}Deleting local registry...${NC}"
ctlptl delete registry ctlptl-registry || docker rm -f ctlptl-registry

echo -e "${GREEN}✓ Cleanup complete${NC}"
