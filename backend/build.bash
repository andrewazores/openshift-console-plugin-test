#!/usr/bin/env bash

set -xe

DIR="$(dirname "$(readlink -f "$0")")"

podman build "${DIR}" -t quay.io/andrewazores/openshift-console-plugin-test-backend:latest -f "${DIR}/Containerfile"
