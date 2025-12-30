package metrics

import (
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/promauto"
)

var (
	HTTPRequestsTotal = promauto.NewCounterVec(
		prometheus.CounterOpts{
			Name: "http_requests_total",
			Help: "Total number of HTTP requests",
		},
		[]string{"method", "path", "status"},
	)

	HTTPRequestDuration = promauto.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "http_request_duration_seconds",
			Help:    "HTTP request duration in seconds",
			Buckets: prometheus.DefBuckets,
		},
		[]string{"method", "path"},
	)

	TasksCreatedTotal = promauto.NewCounter(
		prometheus.CounterOpts{
			Name: "tasks_created_total",
			Help: "Total number of tasks created",
		},
	)

	TasksCompletedTotal = promauto.NewCounter(
		prometheus.CounterOpts{
			Name: "tasks_completed_total",
			Help: "Total number of tasks completed",
		},
	)

	TasksDeletedTotal = promauto.NewCounter(
		prometheus.CounterOpts{
			Name: "tasks_deleted_total",
			Help: "Total number of tasks deleted",
		},
	)

	// track the current number of active/non-completed tasks
	ActiveTasks = promauto.NewGauge(
		prometheus.GaugeOpts{
			Name: "active_tasks",
			Help: "Current number of active tasks",
		},
	)
)
