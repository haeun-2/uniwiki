pipeline {
    agent any
    
    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'develop',
                    credentialsId: 'gitlab-token1',
                    url: 'https://lab.ssafy.com/s13-final/S13P31D104.git'
                    
                echo '✅ 코드 체크아웃 완료'
                sh 'pwd && ls -la'
            }
        }
        
        stage('Prepare') {
            steps {
                sh '''
                    echo "📋 환경 확인"
                    docker --version
                    docker-compose --version || echo "docker-compose not found"
                '''
            }
        }
        
        stage('Stop Old Containers') {
            steps {
                sh '''
                    echo "🛑 기존 컨테이너 중지"
                    docker-compose -f ${DOCKER_COMPOSE_FILE} down || true
                '''
            }
        }
        
        stage('Build Images') {
            steps {
                sh '''
                    echo "🔨 이미지 빌드"
                    docker-compose -f ${DOCKER_COMPOSE_FILE} build --no-cache
                '''
            }
        }
        
        stage('Deploy') {
            steps {
                sh '''
                    echo "🚀 서비스 배포"
                    docker-compose -f ${DOCKER_COMPOSE_FILE} up -d
                '''
            }
        }
        
        stage('Verify') {
            steps {
                sh '''
                    echo "✅ 배포 확인"
                    docker ps
                '''
            }
        }
    }
    
    post {
        success {
            echo '✅ 배포 성공! 🎉'
        }
        failure {
            echo '❌ 배포 실패'
            sh 'docker ps -a || true'
        }
    }
}