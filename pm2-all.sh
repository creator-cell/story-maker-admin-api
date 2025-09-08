#!/bin/bash

ACTION=$1
CONFIG_FILE="pm2.config.js"
NAMESPACE="story-maker-admin"

case $ACTION in
  start)
    echo "▶️ Starting all services using $CONFIG_FILE (namespace: $NAMESPACE)..."
    pm2 start $CONFIG_FILE
    ;;
  restart)
    echo "🔁 Restarting all services in namespace $NAMESPACE..."
    pm2 restart $NAMESPACE
    ;;
  stop)
    echo "🛑 Stopping all services in namespace $NAMESPACE..."
    pm2 stop $NAMESPACE
    ;;
  delete)
    echo "❌ Deleting all services in namespace $NAMESPACE..."
    pm2 delete $NAMESPACE
    ;;
  status)
    echo "📊 PM2 Service Status (namespace: $NAMESPACE):"
    pm2 ls
    ;;
  logs)
    echo "📄 Showing PM2 logs (Ctrl+C to exit)..."
    pm2 logs $NAMESPACE
    ;;
  help|*)
    echo ""
    echo "Usage: ./pm2-all.sh [command]"
    echo ""
    echo "Commands:"
    echo "  start     Start all services using $CONFIG_FILE"
    echo "  restart   Restart all PM2 services in namespace: $NAMESPACE"
    echo "  stop      Stop all PM2 services in namespace: $NAMESPACE"
    echo "  delete    Remove all services from PM2 in namespace: $NAMESPACE"
    echo "  status    Show PM2 service status list"
    echo "  logs      Show logs for namespace: $NAMESPACE"
    echo ""
    ;;
esac