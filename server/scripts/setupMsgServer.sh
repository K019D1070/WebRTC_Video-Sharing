#!/usr/bin/env bash
cd ~/messaging-server
set -e
export PATH="$HOME/.nodenv/bin:$HOME/.nodenv/shims:$PATH"
nodenv install "$(nodenv local)"
echo $PATH
npm install
