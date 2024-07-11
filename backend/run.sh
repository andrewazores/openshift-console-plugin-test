#!/usr/bin/env bash

set -xe

exec podman run --rm -it --publish 9898:9898 openshift-console-plugin-test-backend:latest
