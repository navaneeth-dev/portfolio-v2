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

I built a continuous deployment UI with Backstage which uses Kargo and Gitlab CI behind the scenes.

![Backstage Deploy Page](../../images/backstage-neusix-1.png)

Compared to our previous approach, this is has:

- Better visiblity of current deployments and what version is running
- One UI to manage Gitlab and Kargo (Kubernetes)
- Increased speed of deployment
- Self service promotion for anyone

Our earlier approach we had to use Gitlab CI pipelines and Kargo to promote one by one.

## Backstage

![Backstage icon](../../images/backstage-icon-color.svg)

We choose Backstage because of speed of development with AI and CNCF backed framework. I am also going to develop
and maintain a public Gitlab plugin for Backstage (coming soon).
