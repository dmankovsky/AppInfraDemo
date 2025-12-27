.PHONY: help setup teardown dev build test lint clean

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
	@tilt up

dev-down:
	@tilt down || true
	@pkill -f "tilt up" || true
	@echo "Tilt stopped"


build:

test:

lint:

clean:
