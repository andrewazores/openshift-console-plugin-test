#!/usr/bin/env bash

set -xe

DIR="$(dirname "$(readlink -f "$0")")"

podman buildx build --platform="${PLATFORMS:-linux/amd64,linux/arm64}" --manifest quay.io/andrewazores/openshift-console-plugin-test:latest -f "${DIR}/Dockerfile" "${DIR}"
