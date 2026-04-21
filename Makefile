.PHONY: help dev dev-down build-backend build-frontend test lint clean

help:
	@echo "Usage: make [target]"
	@echo ""
	@echo "Available targets:"
	@awk 'BEGIN {FS = ":.*?## "} /^[a-zA-Z_-]+:.*?## / {printf "  %-15s %s\n", $$1, $$2}' $(MAKEFILE_LIST)

port-forward-argocd:
	@kubectl port-forward -n argocd svc/argocd-server 8081:443

get-argocd-password:
	@kubectl -n argocd get secret argocd-initial-admin-secret -o jsonpath="{.data.password}" | base64 -d && echo

dev:
	@which k3d > /dev/null 2>&1 || (echo "Installing k3d..." && brew install k3d)
	@which ctlptl > /dev/null 2>&1 || (echo "Installing ctlptl..." && brew install tilt-dev/tap/ctlptl)
	@echo "Creating/ensuring k3d cluster..."
	@ctlptl apply -f cluster/cluster.yaml
	@CURRENT_CONTEXT=$$(kubectl config current-context 2>/dev/null); \
	if [ "$$CURRENT_CONTEXT" = "k3d-task-app-cluster" ]; then \
		echo "Current context: k3d-task-app-cluster"; \
	else \
		echo "Changing context to k3d-task-app-cluster"; \
		kubectl config use-context k3d-task-app-cluster; \
	fi
	@tilt up

dev-down:
	@tilt down || true
	@pkill -f "tilt up" || true
	@echo "Tilt stopped"

cluster-delete:
	@echo "Deleting cluster..."
	@k3d cluster delete task-app-cluster || true
	@echo "Cluster deleted"

build-backend:
	@cd backend && go build -o main .

install-frontend-deps:
	@cd frontend && npm install

build-frontend: install-frontend-deps
	@cd frontend && npm run build

build: build-backend build-frontend

test:

lint:

clean:

