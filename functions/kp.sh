#!/usr/bin/env bash
#
# Kill process by port or name

# Usage:
# kp [port|process_name]

kp() {
  ARG="$1"

  if [ -z "$ARG" ]; then
    echo "Please provide port number or process name."
    return 1
  fi

  if [[ "$ARG" =~ ^[0-9]+$ ]]; then
    # Argument is a port number
    PIDS=$(lsof -i :"$ARG" -t)
    if [ -z "$PIDS" ]; then
      echo "No process found running on port $ARG."
      echo ""
      return 0
    fi

    echo "Killing processes on port $ARG:"
    # shellcheck disable=SC2116
    for PID in $(echo "$PIDS"); do
      PROCESS_NAME=$(ps -p "$PID" -o comm=)
      echo "  Killing $PROCESS_NAME (PID: $PID)"
      kill -9 "$PID"
    done

    echo ""
    echo "Processes on port $ARG killed successfully."

  else
    # Argument is a process name
    PIDS=$(pgrep "$ARG")
    if [ -z "$PIDS" ]; then
      echo "No process found with name $ARG."
      echo ""
      return 0
    fi

    echo "Killing processes with name '$ARG':"
    # shellcheck disable=SC2116
    for PID in $(echo "$PIDS"); do
      PROCESS_NAME=$(ps -p "$PID" -o comm=)
      echo "  Killing process $PROCESS_NAME (PID: $PID)"
      kill -9 "$PID"
    done

    echo ""
    echo "Processes with name '$ARG' killed successfully."
  fi
}
