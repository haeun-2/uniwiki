pipeline {
    agent any
    
    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.yml'
    }
    
    stages {
        stage('Checkout') {
            steps {
                echo '✅ 코드 체크아웃 완료'
                sh 'pwd && ls -la'
            }
        }
        
        stage('Stop Old Containers') {
            steps {
                script {
                    sh '''
                        echo "🛑 기존 컨테이너 중지 중..."
                        docker compose -f ${DOCKER_COMPOSE_FILE} down || true
                    '''
                }
            }
        }
        
        stage('Build Images') {
            steps {
                script {
                    sh '''
                        echo "🔨 Docker 이미지 빌드 중..."
                        docker compose -f ${DOCKER_COMPOSE_FILE} build --no-cache
                    '''
                }
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    sh '''
                        echo "🚀 컨테이너 배포 중..."
                        docker compose -f ${DOCKER_COMPOSE_FILE} up -d
                    '''
                }
            }
        }
        
        stage('Verify') {
            steps {
                script {
                    sh '''
                        echo "✅ 배포 확인 중..."
                        docker ps
                    '''
                }
            }
        }
        
        stage('Clean Up') {
            steps {
                script {
                    sh '''
                        echo "🧹 사용하지 않는 이미지 정리 중..."
                        docker image prune -f
                    '''
                }
            }
        }
    }
    
    post {
        success {
            echo '✅ 배포 성공! 🎉'
        }
        failure {
            echo '❌ 배포 실패 😢'
            sh 'docker ps -a'
        }
        always {
            echo '📋 빌드 완료'
        }
    }
}