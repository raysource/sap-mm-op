#!/usr/bin/env bash
# 本地预览：SAP GUI 8.10 实操课程站
cd "$(dirname "$0")" || exit 1
PORT="${PORT:-8846}"
echo "SAP GUI 8.10 实操课程站 → http://127.0.0.1:${PORT}/"
echo "仿真器：http://127.0.0.1:${PORT}/sim.html    引导实操：http://127.0.0.1:${PORT}/lab.html"
python3 -m http.server "$PORT"
