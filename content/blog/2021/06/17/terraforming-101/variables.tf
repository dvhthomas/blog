variable "project-id" {
  description = "GCP project ID"
  type        = string
  sensitive   = false
}

variable "gcp-region" {
  description = "GCP region"
  type        = string
  sensitive   = false
}

variable "svc-account-tt" {
  description = "Service account that Traintrack will run as"
  type        = string
}

variable "artifact-repo" {
  description = "Name of the Google Artifact repository where images are published"
  type        = string
}

variable "cloud-run-service" {
  description = "Name of the Cloud Run service"
  type        = string
}

variable "site-address" {
  description = "Fully qualified domain name where the service will be accessible, e.g., mysite.company.com"
  type        = string
}
