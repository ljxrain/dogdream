# SSH密钥自动部署指南

## 步骤1: 生成SSH密钥对

在PowerShell中执行：

```powershell
# 生成SSH密钥对
ssh-keygen -t rsa -b 4096 -C "dreamhome-deploy"

# 提示时按回车使用默认路径: C:\Users\你的用户名\.ssh\id_rsa
# 提示设置密码时可以直接按回车（无密码）或设置一个密码
```

## 步骤2: 复制公钥到腾讯云服务器

```powershell
# 方法1: 使用ssh-copy-id（推荐）
ssh-copy-id root@49.232.220.223

# 方法2: 手动复制
type C:\Users\你的用户名\.ssh\id_rsa.pub | ssh root@49.232.220.223 "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"
```

## 步骤3: 测试SSH密钥登录

```powershell
# 测试无密码登录
ssh root@49.232.220.223

# 如果成功，你应该能直接登录而不需要输入密码
```

## 步骤4: 使用自动化部署脚本

一旦SSH密钥配置成功，就可以使用自动化脚本：

```bash
# 上传部署包
scp dreamhome-deploy-20250618_125151.tar.gz root@49.232.220.223:/opt/

# 上传部署脚本
scp deploy-to-tencent.sh root@49.232.220.223:/opt/

# 远程执行部署
ssh root@49.232.220.223 "cd /opt && tar -xzf dreamhome-deploy-20250618_125151.tar.gz && chmod +x deploy-to-tencent.sh && ./deploy-to-tencent.sh"
```

## 腾讯云服务器信息
- 公网IP: 49.232.220.223
- 内网IP: 10.2.20.6
- 用户名: root
- 密码: Ljxrain123（仅首次配置SSH密钥时需要）

## 注意事项

1. **首次配置**: 第一次设置SSH密钥时仍需要输入密码
2. **安全性**: SSH密钥比密码更安全，建议长期使用
3. **备份**: 请备份生成的私钥文件（id_rsa）
4. **权限**: 确保服务器上的~/.ssh目录权限为700，authorized_keys文件权限为600

## 故障排除

如果SSH密钥登录失败：

```bash
# 检查服务器SSH配置
ssh root@49.232.220.223 "cat /etc/ssh/sshd_config | grep -E 'PubkeyAuthentication|AuthorizedKeysFile'"

# 检查authorized_keys文件权限
ssh root@49.232.220.223 "ls -la ~/.ssh/"

# 重启SSH服务
ssh root@49.232.220.223 "systemctl restart sshd"
``` 