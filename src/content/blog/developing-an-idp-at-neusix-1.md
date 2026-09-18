---
title: "Building an IDP @ NeuSix"
tags:
  - devops
  - platform engineering
  - backstage
  - kubernetes
pubDate: "Sep 17 2026"
image: /building-an-internal-developer-platform.jpg
description: How I built the first version of the NeuSix's Internal Developer Platform with Backstage, Keycloak, Kargo, Kubernetes, and OpenTelemetry.
author: Navaneeth
isDraft: false
---

Building an Internal Developer Platform is not just about putting a UI in front of Kubernetes. The difficult part is deciding which system owns identity, source code, delivery state, and authorization, and then connecting those systems without creating another source of truth.

At NeuSix, we built the first version of our IDP on top of Backstage. This post summarizes the features we worked on, the boundaries we established, and what we learned while turning a Backstage starter application into an internal product.

## What we built

The first iteration included:

- A Backstage-based developer portal branded as the NeuSix IDP.
- Keycloak single sign-on.
- A Kargo deployment matrix with promotion controls.
- OpenTelemetry traces and Prometheus metrics.
- CI, container packaging, Harbor publication, and automated releases.

The goal was not to replace the tools our engineers already use. Backstage became the common interface, while the existing systems remained authoritative:

- **Keycloak** owns identity.
- **GitLab** owns source code and CI pipelines.
- **Kargo** owns delivery state and environment promotion.
- **Kubernetes** owns runtime workload state.
- **The Backstage Catalog** maps these systems to the services our teams understand.

## Keycloak SSO

We replaced Backstage's guest authentication with Keycloak OIDC. Engineers sign in through the NeuSix Keycloak realm, and Backstage uses the immutable OIDC `sub` claim as the user identity.

This allowed any valid realm user to access the initial version of the portal without requiring a matching Backstage Catalog user. Sessions last eight hours, and signing out only clears the local Backstage session instead of terminating the user's global Keycloak session.

The browser never receives the Keycloak client secret. Authentication secrets are supplied through environment variables and consumed by the Backstage backend.

Our initial authorization model is intentionally broad: authenticated NeuSix users can access the current features. Ownership-, group-, and user-specific policies are future work.

## Kargo deployment matrix

The top-level **Deploy** page presents delivery state from Kargo. It started with the DEV and UAT environments for the Aham Platform, and was then generalized to discover Kargo projects owned through the Backstage Catalog.

The page obtains its data dynamically from Kargo and displays:

- Project and environment.
- Workload.
- Version and deployment time.
- Health and promotion status.
- Success, failure, and no-data states.

Eligible targets include promotion controls, with confirmation before a write is submitted. We also added a **Promote all to UAT** action.

Kargo has no atomic API for promoting a collection of workloads. Therefore, "Promote all" is implemented as one downstream-promotion request for each distinct DEV Freight. The UI prevents concurrent submissions and the backend rejects stale requests.

Before creating a promotion, the backend:

1. Resolves the Kargo project through Catalog metadata.
2. Derives the current upstream Freight.
3. Validates the project and target environment.
4. Checks the `kargoPromotions.create` permission.
5. Submits the request using a backend-only Kargo token.

This is an important platform principle: the UI expresses intent, but the backend derives and validates the actual deployment operation.

We verified the deployment matrix against live Kargo data. We did not execute a live promotion while validating this iteration.

![Backstage Deploy Page](/public/backstage-neusix-1.png)

## Kubernetes visibility

We registered Backstage's official Kubernetes plugin and added Kubernetes identifiers to our service Components. Services now receive a Kubernetes tab automatically, while website Components remain unaffected.

The Catalog side is complete, but workload visibility still depends on cluster credentials, RBAC, and matching `backstage.io/kubernetes-id` labels on Kubernetes resources. Adding a tab is easy; establishing secure and reliable cluster access is the real integration work.

## Observability from the beginning

The IDP exports OpenTelemetry traces over OTLP/HTTP and Prometheus metrics on port `9464`. The OpenTelemetry SDK is preloaded before application imports so that framework and HTTP instrumentation are initialized early enough.

For local development, we added Jaeger to inspect traces. The trace endpoint and service name are configurable, so production can send the same telemetry to a compatible collector such as Grafana Tempo without application changes.

The production container also copies and preloads the instrumentation entrypoint. Observability that only works on a developer's machine is not observability.

## CI, packaging, and releases

The GitLab pipeline validates formatting, linting, TypeScript, tests, and production builds. It also builds the Backstage backend image using the recommended production Docker structure.

Images are published to Harbor using commit SHA, `latest`, and release-version tags. Conventional Commits and semantic-release automate versioning and releases.

We also removed the SQLite production dependencies that Backstage starts with. They were unnecessary for our production architecture and added native dependencies to the final image.

## Security boundaries

Several rules guided these integrations:

- User authentication comes from Keycloak.
- GitLab and Kargo service credentials remain on the backend.
- The browser submits intent, not unrestricted external resource identifiers.
- Catalog metadata maps a NeuSix service to GitLab, Kargo, and Kubernetes.
- Backend permissions protect both read and write operations.
- Deployment actions include immutable user identity and target details in audit logs.

These boundaries are more important than any individual UI component. An IDP becomes dangerous if it centralizes powerful credentials but allows the frontend to direct them toward arbitrary resources.

## Verification

We tested the work with mocked frontend and backend tests, TypeScript checks, linting, formatting, configuration validation, and production builds. By the end of this iteration, all 45 tests passed.

We also performed targeted live and visual checks:

- Keycloak sign-in and the GitLab Jobs UI.
- Read-only GitLab API response shapes.
- Live Kargo deployment data.
- Prometheus metrics and trace delivery to Jaeger.
- Production image builds and OpenTelemetry preload behavior.
- Kubernetes entity-page smoke testing.

## What is next?

This is only the foundation. The next iterations can add:

- Ownership- and group-based authorization.
- Keycloak user-token passthrough where per-user downstream authorization is required.
- GitLab job logs, artifacts, and filters.
- User-visible and persisted deployment audit history.
- Production promotion policies and cancellation controls.
- Kubernetes cluster credentials, RBAC, and workload labels.
- A standard onboarding template for new services.

The main lesson from this iteration is that an IDP should integrate authoritative systems, not quietly replace them. Backstage gives us a consistent product surface, but identity stays in Keycloak, CI stays in GitLab, deployments stay in Kargo, and runtime state stays in Kubernetes.

In the next post, I will go deeper into one of these workflows and the decisions behind it.
