pipeline {
    agent {
        docker {
            image 'node:22'
        }
    }
    
    environment {
        REPO_URL = 'https://github.com/balamut-ark/TravelFrog.git'
        BRANCH = 'main'
    }
    
    stages {
        stage('Checkout') {
            steps {
                script {
                    // Ensure we're on the main branch
                    sh '''
                        git fetch origin
                        git checkout main || git checkout -b main
                        git pull origin main
                    '''
                }
            }
        }
        
        stage('Install Dependencies') {
            steps {
                dir('backend') {
                    sh 'npm install'
                }
                dir('frontend') {
                    sh 'npm install'
                }
            }
        }
        
        stage('Build') {
            steps {
                dir('backend') {
                    sh 'npm run build'
                }
                dir('frontend') {
                    sh 'npm run build'
                }
            }
        }
        
        stage('Deploy') {
            steps {
                echo 'Deployment stage - configure your deployment steps here'
            }
        }
    }
    
    post {
        always {
            echo 'Pipeline completed'
        }
        failure {
            echo 'Pipeline failed'
        }
        success {
            echo 'Pipeline succeeded'
        }
    }
}
