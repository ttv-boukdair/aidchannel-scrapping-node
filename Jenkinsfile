node {
    def app

     def  BRANCH_NAME="${env.BRANCH_NAME}"
// test updates
      if (BRANCH_NAME == "main") {
    stage('Clone repository') {
        /* Cloning the Repository to our Workspace */
        checkout scm
    }

    stage('Build image') {
    //    app = docker.build("reformtracker_front")
          app = docker.build("aidchannel_scrapping_node")
    }
    // stage('Test image') {
    //     app.inside {
    //         echo "Tests passed"
    //     }
    // }

    stage('Push image to ttv registry') {
        /* 
			You would need to first register with DockerHub before you can push images to your account
		*/
        docker.withRegistry('https://registry.data4jobs.com', 'registory_login') {
            app.push("${env.BUILD_NUMBER}")
            app.push("latest")
            } 
                echo "Trying to Push Docker"
    }
    stage('send  and exécute docker compose to swarm') {
    sshPublisher(
publishers: 
[sshPublisherDesc(
    configName: 'jt_server_1_login',
     transfers: [sshTransfer(
         cleanRemote: false, 
         excludes: '', 
// execCommand: "sudo docker stack deploy --compose-file /home/ubuntu/projects/refrom/reform-front/docker-compose.yml reform",
execCommand: "sudo docker stack deploy --compose-file /home/ubuntu/aidchannel/aidchannel_scrapping_node/docker-compose.yml aidchannel",
//    execCommand:"echo test",
  execTimeout: 120000, 
      flatten: false, 
      makeEmptyDirs: true, 
      noDefaultExcludes: false, 
      patternSeparator: '[, ]+', 
      remoteDirectory: '/aidchannel/aidchannel_scrapping_node', 
      remoteDirectorySDF: false, 
      removePrefix: '', 
      sourceFiles: '**/docker-compose.yml')], 
      usePromotionTimestamp: false, 
      useWorkspaceInPromotion: false, 
      verbose: true)])
    }
}
 else{
 echo "pre-prod oush nothing to do"
 }}