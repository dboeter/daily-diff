## OpenShell v0.1.6

### Quick install

```bash
curl -LsSf https://raw.githubusercontent.com/NVIDIA/OpenShell/main/install.sh | OPENSHELL_VERSION=v0.1.6 sh
```

### Upgrade notes

- Gateways now refuse to start unless OIDC, mTLS user or operator authentication, or gateway JWTs are configured. For trusted local development only, set `allow_unauthenticated_users = true` under `[openshell.gateway.auth]`. [#4821](https://github.com/NVIDIA/OpenShell/pull/4821)
- New sandboxes on Kubernetes, Docker, Podman, and VM now open the control connection from the sandbox to its supervisor, while running sandboxes keep their existing connection direction. Upgrade the supervisor and sandbox runtime binaries together, because older binaries reject the new sandboxes. [#4656](https://github.com/NVIDIA/OpenShell/pull/4656)
- You can now suspend and resume sandboxes with `openshell sandbox suspend` and `openshell sandbox resume` or through the SDKs, on compute drivers that support it; other drivers return an unimplemented error. External isolation backends need to know that `ResumeBoundaryRequest` field 3 is renamed from `allow_cold_start_fallback` to `restart_if_restore_fails`. [#4765](https://github.com/NVIDIA/OpenShell/pull/4765)

### Bug fixes

- The Python SDK now ships the credential driver and extension protocol bindings, so you can write credential drivers in Python. [#4760](https://github.com/NVIDIA/OpenShell/pull/4760)
- A busy sandbox no longer stalls lifecycle operations on unrelated sandboxes while the gateway checks provisioning deadlines. [#4549](https://github.com/NVIDIA/OpenShell/pull/4549)
- The Podman driver now waits up to 60 seconds instead of 30 for API calls, which reduces timeouts during sandbox creation. [#4820](https://github.com/NVIDIA/OpenShell/pull/4820)
- Updated webpki to stop trusting the compromised emSign certificate authorities (CVE-2026-111943). [#4794](https://github.com/NVIDIA/OpenShell/pull/4794)
- Updated russh to 0.64.1 to fix GHSA-4wc5-f2rc-q74m (CVE-2026-111061). [#4742](https://github.com/NVIDIA/OpenShell/pull/4742)
- Updated Tokio and crypto-bigint to fix RUSTSEC-2026-0386 and RUSTSEC-2026-0387. [#4924](https://github.com/NVIDIA/OpenShell/pull/4924)
- Updated ctutils to fix the RUSTSEC-2026-0385 timing advisory. [#4867](https://github.com/NVIDIA/OpenShell/pull/4867)

### Features

- Kubernetes gateways can run an experimental shared supervisor that hosts many sandboxes in one process. Enable it with `supervisor_topology = "gateway"` under `[openshell.drivers.kubernetes]` (gateway TLS is required), and on OpenShift use `supervisor.podSecurityContext` so restricted-v2 can assign the IDs. [#4695](https://github.com/NVIDIA/OpenShell/pull/4695), [#4701](https://github.com/NVIDIA/OpenShell/pull/4701), [#4702](https://github.com/NVIDIA/OpenShell/pull/4702), [#4785](https://github.com/NVIDIA/OpenShell/pull/4785)
- The Helm chart adds `server.extraEnv` for passing extra environment variables, including Secret references, to the gateway container. [#4876](https://github.com/NVIDIA/OpenShell/pull/4876)

### Other

- The Docker supervisor healthcheck now runs every 30 seconds once the sandbox is ready, rather than every 250 ms. [#4802](https://github.com/NVIDIA/OpenShell/pull/4802)
- Updated the rust-cache action. [#4748](https://github.com/NVIDIA/OpenShell/pull/4748)
