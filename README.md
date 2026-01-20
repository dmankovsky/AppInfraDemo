# AppInfraDemo
## Motivation Behind the Project
This repo is a work in progress but already in a functional state.

Its purpose is to create infrastructure for a fully-fledged local k8s cluster and deploy a sample (and simple) application into it. In this case, a task app.

This approach is a massive improvement of a development workflow. It increases the speed of development and testing, and helps to catch errors early in the development process, before changes are deployed to a real cluster.

## Prerequisites

- Docker installed and running
- Git installed

That's it! Tilt will install everything else (kubectl, helm, ctlptl, k3d).

## Step 1: Start Everything

```bash
make dev
```

This **one command** will:
- Create the k3d cluster
- Add Helm repositories  
- Install ArgoCD
- Port-forward to ArgoCD UI

This may take ~3-5 minutes on first run

Open Tilt UI at http://localhost:10350 to watch progress.

## Step 2: Access ArgoCD

**ArgoCD UI**: http://localhost:8081
- Username: `admin`
- Password: Run `make get-argocd-password`

## Monitoring

All monitoring services are accessible via port forwarding (no DNS or /etc/hosts needed!).

### Quick Access via Tilt

1. Open Tilt UI: http://localhost:10350
2. Find the service (`argocd`, `grafana`, or `prometheus`)
3. Click the service name and click "Enable"
4. Access via the URLs below

### ArgoCD

**Option 1: Via Tilt (Recommended)**
- Enable `argocd` resource in Tilt UI
- Access: http://localhost:8081

**Option 2: Manual Port Forward**
```bash
kubectl port-forward -n argocd svc/argocd-server 8081:8080
```

Access: http://localhost:8081
- Username: `admin`
- Password: Get it with `make get-argocd-password`

## Helpful Commands

```bash
# See all available commands
make help

# Stop Tilt
make dev-down

# Destroy everything
make cluster-delete
```

## Troubleshooting

**Pods not starting?**
```bash
kubectl get pods -A
kubectl describe pod <pod-name> -n <namespace>
```

**Tilt errors?**
```bash
tilt down
tilt up
```

## Next Steps (Already Implemented and Planned)

1. **Explore the code**: Check out `backend/` and `frontend/`
2. **Modify the app**: Tilt will auto-reload the changes
3. **Add features**: Extend the API and UI
4. **Create dashboards**: Build Grafana dashboards with the metrics
5. **Deploy with ArgoCD**: Update `argocd/applications/task-app.yaml` with your Git repo
