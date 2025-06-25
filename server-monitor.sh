#!/bin/bash

# 狗狗造梦家服务器监控脚本
# 用于检查系统健康状态并自动恢复服务

LOG_FILE="/var/log/dreamhome-monitor.log"
DATE=$(date '+%Y-%m-%d %H:%M:%S')

# 日志函数
log() {
    echo "[$DATE] $1" | sudo tee -a $LOG_FILE
}

# 检查应用状态
check_app() {
    if ! pm2 describe dreamhome > /dev/null 2>&1; then
        log "ERROR: PM2应用未运行，尝试重启"
        pm2 restart dreamhome
        sleep 10
    fi
    
    # 检查HTTP响应
    if ! curl -f http://localhost:3000 > /dev/null 2>&1; then
        log "ERROR: 应用HTTP响应失败，重启应用"
        pm2 restart dreamhome
        sleep 10
    fi
}

# 检查Nginx状态
check_nginx() {
    if ! systemctl is-active --quiet nginx; then
        log "ERROR: Nginx未运行，尝试重启"
        sudo systemctl restart nginx
        sleep 5
    fi
}

# 检查PostgreSQL状态
check_postgresql() {
    if ! sudo -u postgres psql -c '\l' > /dev/null 2>&1; then
        log "ERROR: PostgreSQL连接失败，尝试重启"
        sudo systemctl restart postgresql
        sleep 10
    fi
}

# 检查磁盘空间
check_disk() {
    DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
    if [ $DISK_USAGE -gt 85 ]; then
        log "WARNING: 磁盘使用率${DISK_USAGE}%，建议清理"
    fi
}

# 检查内存使用
check_memory() {
    MEM_USAGE=$(free | awk 'NR==2{printf "%.2f", $3*100/$2}')
    if (( $(echo "$MEM_USAGE > 90" | bc -l) )); then
        log "WARNING: 内存使用率${MEM_USAGE}%，建议检查"
    fi
}

# 主监控流程
main() {
    log "开始系统健康检查"
    
    check_app
    check_nginx
    check_postgresql
    check_disk
    check_memory
    
    log "系统健康检查完成"
}

# 运行监控
main 