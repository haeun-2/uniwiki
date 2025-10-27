pipeline {
    agent any
    
    environment {
        DOCKER_COMPOSE_FILE = 'docker-compose.prod.yml'
    }
    
    stages {
        stage('Checkout') {
            steps {
                git branch: 'main',
                    credentialsId: 'gitlab-token',
                    url: 'https://gitlab.com/your-username/your-repo.git'
            }
        }
        
        stage('Stop Old Containers') {
            steps {
                script {
                    sh '''
                        docker compose -f ${DOCKER_COMPOSE_FILE} down || true
                    '''
                }
            }
        }
        
        stage('Build Images') {
            steps {
                script {
                    sh '''
                        docker compose -f ${DOCKER_COMPOSE_FILE} build --no-cache
                    '''
                }
            }
        }
        
        stage('Deploy') {
            steps {
                script {
                    sh '''
                        docker compose -f ${DOCKER_COMPOSE_FILE} up -d
                    '''
                }
            }
        }
        
        stage('Clean Up') {
            steps {
                script {
                    sh '''
                        docker image prune -f
                    '''
                }
            }
        }
    }
    
    post {
        success {
            echo '배포 성공! 🎉'
        }
        failure {
            echo '배포 실패 😢'
        }
    }
}
