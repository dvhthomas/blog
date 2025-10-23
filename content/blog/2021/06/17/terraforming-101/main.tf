terraform {
  backend "local" {
  }

  required_providers {
    google = {
      source  = "hashicorp/google"
      version = "3.58.0"
    }
  }
}

provider "google" {
  project = var.project-id
  region  = var.gcp-region
}

resource "google_service_account" "service_account" {
  account_id   = var.svc-account-tt
  display_name = "Service account running Train Track cloud run app"
}


resource "google_artifact_registry_repository" "artifact-repo" {
  provider      = google-beta
  location      = var.gcp-region
  project       = var.project-id
  repository_id = var.artifact-repo
  description   = "Train Track docker repository"
  format        = "DOCKER"
}

resource "google_compute_region_network_endpoint_group" "cloudrun_neg" {
  name                  = "neg-cloudrun"
  network_endpoint_type = "SERVERLESS"
  region                = var.gcp-region
  cloud_run {
    # This confused me. Thought the Cloud Run service has to exist
    # first, but just providing the name is enough. Good! Because otherwise
    # not sure how to create a Cloud Run service without first pushing a docker
    # image...which is not possible if the Artifact Registry is also being
    # created by Terraform. Chicken and egg.
    service = var.cloud-run-service
  }
}

resource "google_compute_backend_service" "backend-service" {
  provider = google-beta
  name     = "bes-traintrack"
  project  = var.project-id

  backend {
    group = google_compute_region_network_endpoint_group.cloudrun_neg.id
  }
}

# This is the load balancer
resource "google_compute_url_map" "urlmap" {
  name        = "urlmap-traintrack"
  description = "Directs all traffic directly to backend service without any URL mapping"

  default_service = google_compute_backend_service.backend-service.id
}

resource "google_dns_record_set" "dns-traintrack" {
  # Learned the dangling period trick
  name = "${var.site-address}."
  type = "A"
  ttl  = 300

  project      = "woolpert-corporate-assets"
  managed_zone = "woolpert-io"


  rrdatas = [google_compute_global_address.external-ip-address.address]
}

resource "google_compute_managed_ssl_certificate" "managed-cert" {
  name = "site-cert"

  managed {
    domains = [google_dns_record_set.dns-traintrack.name]
  }
}

# This is the Front End part of the Load Balancer. It won't be
# visible as such in the Cloud Console UI until the forwarding
# rule below is created to expose it to the outside world
resource "google_compute_target_https_proxy" "default-proxy" {
  name             = "proxy-traintrack"
  url_map          = google_compute_url_map.urlmap.id
  ssl_certificates = [google_compute_managed_ssl_certificate.managed-cert.id]
}

resource "google_compute_global_address" "external-ip-address" {
  name    = "ip-ext-traintrack"
  project = var.project-id
}

resource "google_compute_global_forwarding_rule" "default" {
  name   = "global-rule"
  target = google_compute_target_https_proxy.default-proxy.id
  # The Target Proxy explicitly accepts only SSL traffic
  port_range = "443"
  ip_address = google_compute_global_address.external-ip-address.address
}
