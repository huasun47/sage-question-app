#!/bin/bash

# Docker 部署验证脚本
set -e

echo "🐳 开始验证 Docker 部署..."

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 检查函数
check_command() {
    if command -v $1 &> /dev/null; then
        echo -e "${GREEN}✓ $1 已安装${NC}"
        $1 --version
    else
        echo -e "${RED}✗ $1 未安装${NC}"
        exit 1
    fi
}

# 1. 检查 Docker 环境
echo "1. 检查 Docker 环境..."
check_command docker
check_command docker-compose

# 2. 构建镜像
echo "2. 构建生产环境镜像..."
if docker build -t sage-question-app .; then
    echo -e "${GREEN}✓ 镜像构建成功${NC}"
else
    echo -e "${RED}✗ 镜像构建失败${NC}"
    exit 1
fi

# 检查镜像大小
IMAGE_SIZE=$(docker images sage-question-app --format "{{.Size}}")
echo -e "${GREEN}镜像大小: $IMAGE_SIZE${NC}"

# 3. 创建测试环境变量
echo "3. 创建测试环境变量..."
cat > .env.test << EOF
NEXT_PUBLIC_SUPABASE_URL=https://test.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=test-key
NODE_ENV=production
EOF

# 4. 运行容器测试
echo "4. 运行容器测试..."
CONTAINER_NAME="sage-question-test"

# 清理可能存在的旧容器
docker stop $CONTAINER_NAME 2>/dev/null || true
docker rm $CONTAINER_NAME 2>/dev/null || true

# 启动容器
docker run -d \
  --name $CONTAINER_NAME \
  -p 3000:3000 \
  --env-file .env.test \
  sage-question-app

# 等待应用启动
echo "等待应用启动..."
for i in {1..30}; do
    if curl -f http://localhost:3000 &> /dev/null; then
        echo -e "${GREEN}✓ 应用启动成功 (第 $i 秒)${NC}"
        break
    fi
    if [ $i -eq 30 ]; then
        echo -e "${RED}✗ 应用启动超时${NC}"
        docker logs $CONTAINER_NAME
        docker stop $CONTAINER_NAME
        docker rm $CONTAINER_NAME
        exit 1
    fi
    sleep 1
done

# 5. 检查容器状态
echo "5. 检查容器状态..."
CONTAINER_STATUS=$(docker inspect --format='{{.State.Status}}' $CONTAINER_NAME)
if [ "$CONTAINER_STATUS" = "running" ]; then
    echo -e "${GREEN}✓ 容器运行正常${NC}"
else
    echo -e "${RED}✗ 容器状态异常: $CONTAINER_STATUS${NC}"
    docker logs $CONTAINER_NAME
    exit 1
fi

# 6. 测试应用功能
echo "6. 测试应用功能..."
# 测试首页
if curl -s http://localhost:3000 | grep -q "Sage Question"; then
    echo -e "${GREEN}✓ 首页加载正常${NC}"
else
    echo -e "${YELLOW}⚠ 首页可能需要 Supabase 配置才能完全显示${NC}"
fi

# 7. 测试 Docker Compose
echo "7. 测试 Docker Compose..."
# 复制环境变量文件
cp .env.test .env

# 启动 docker-compose
docker-compose up -d

# 等待服务启动
echo "等待 Docker Compose 服务启动..."
sleep 10

# 检查服务状态
if docker-compose ps | grep -q "Up"; then
    echo -e "${GREEN}✓ Docker Compose 服务启动正常${NC}"
else
    echo -e "${RED}✗ Docker Compose 服务启动失败${NC}"
    docker-compose logs
    docker-compose down
    exit 1
fi

# 8. 清理资源
echo "8. 清理测试资源..."
docker stop $CONTAINER_NAME
docker rm $CONTAINER_NAME
docker-compose down
rm -f .env.test .env

echo -e "${GREEN}🎉 Docker 部署验证完成！所有测试通过。${NC}"
echo ""
echo "📋 验证总结:"
echo "  ✓ Docker 环境正常"
echo "  ✓ 镜像构建成功"
echo "  ✓ 容器启动正常"
echo "  ✓ 应用可以访问"
echo "  ✓ Docker Compose 正常工作"
echo ""
echo "🚀 项目已准备好进行 Docker 部署！"
echo ""
echo "📖 使用方法："
echo "  生产环境: docker-compose up -d"
echo "  开发环境: docker-compose -f docker-compose.dev.yml up -d"