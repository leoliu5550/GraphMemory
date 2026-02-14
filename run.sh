#!/bin/bash

# Ensure npm dependencies are installed (silently if possible)
if [ ! -d "node_modules" ]; then
    echo "First time setup: Installing dependencies..."
    npm install --silent
fi

# Pass arguments to the main node script
NODE_NO_WARNINGS=1 node app.js "$@"
