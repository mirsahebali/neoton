#!/usr/bin/env sh

set -xe

docker run --rm --name neoton-valkey -d -p 6379:6379 valkey/valkey
docker run --rm --name mailtest -d -p 1080:1080 -p 1025:1025 marlonb/mailcrab:latest
