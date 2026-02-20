#!/usr/bin/env bash

wp site empty --yes
wp plugin activate academic-bloggers-toolkit-vibed
wp plugin deactivate classic-editor
