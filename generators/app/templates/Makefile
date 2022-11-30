build-cds:
	cds build --production
<% if((hana || schemaName !== '' || hanaTargetHDI !== '') && !multiTenant){ -%>
build-db:
<% if(buildCmd === 'pack'){ -%>
	pack build <% if(dockerRepositoryName !== ''){ -%><%= dockerID %>/<%= dockerRepositoryName %>:<%= projectName %>-db<% }else{ -%><%= dockerID %>/<%= projectName %>-db:latest<% } -%> -p gen/db -B paketobuildpacks/builder:base
<% }else{ -%>
	<%= buildCmd %> build --platform amd64 -t <% if(dockerRepositoryName !== ''){ -%><%= dockerID %>/<%= dockerRepositoryName %>:<%= projectName %>-db<% }else{ -%><%= dockerID %>/<%= projectName %>-db:latest<% } -%> -f gen/db/Dockerfile ./gen
<% } -%>
<% } -%>
<% if(common){ -%>
build-dbcommon:
<% if(buildCmd === 'pack'){ -%>
	pack build <% if(dockerRepositoryName !== ''){ -%><%= dockerID %>/<%= dockerRepositoryName %>:<%= projectName %>-dbcommon<% }else{ -%><%= dockerID %>/<%= projectName %>-dbcommon:latest<% } -%> -p dbcommon -B paketobuildpacks/builder:base
<% }else{ -%>
	<%= buildCmd %> build --platform amd64 -t <% if(dockerRepositoryName !== ''){ -%><%= dockerID %>/<%= dockerRepositoryName %>:<%= projectName %>-dbcommon<% }else{ -%><%= dockerID %>/<%= projectName %>-dbcommon:latest<% } -%> -f db/Dockerfile .
<% } -%>
<% } -%>
build-srv:
<% if(buildCmd === 'pack'){ -%>
	pack build <% if(dockerRepositoryName !== ''){ -%><%= dockerID %>/<%= dockerRepositoryName %>:<%= projectName %>-srv<% }else{ -%><%= dockerID %>/<%= projectName %>-srv:latest<% } -%> -p gen/srv -B paketobuildpacks/builder:base
<% }else{ -%>
	<%= buildCmd %> build --platform amd64 -t <% if(dockerRepositoryName !== ''){ -%><%= dockerID %>/<%= dockerRepositoryName %>:<%= projectName %>-srv<% }else{ -%><%= dockerID %>/<%= projectName %>-srv:latest<% } -%> -f gen/srv/srv/Dockerfile ./gen
<% } -%>
<% if(srv2){ -%>
build-srv2:
<% if(buildCmd === 'pack'){ -%>
	pack build <% if(dockerRepositoryName !== ''){ -%><%= dockerID %>/<%= dockerRepositoryName %>:<%= projectName %>-srv2<% }else{ -%><%= dockerID %>/<%= projectName %>-srv2:latest<% } -%> -p gen/srv2 -B paketobuildpacks/builder:base
<% }else{ -%>
	<%= buildCmd %> build --platform amd64 -t <% if(dockerRepositoryName !== ''){ -%><%= dockerID %>/<%= dockerRepositoryName %>:<%= projectName %>-srv2<% }else{ -%><%= dockerID %>/<%= projectName %>-srv2:latest<% } -%> -f gen/srv2/srv/Dockerfile ./gen
<% } -%>
<% } -%>
<% if(srvjs){ -%>
build-srvjs:
<% if(buildCmd === 'pack'){ -%>
	pack build <% if(dockerRepositoryName !== ''){ -%><%= dockerID %>/<%= dockerRepositoryName %>:<%= projectName %>-srvjs<% }else{ -%><%= dockerID %>/<%= projectName %>-srvjs:latest<% } -%> -p srvjs -B paketobuildpacks/builder:base
<% }else{ -%>
	<%= buildCmd %> build --platform amd64 -t <% if(dockerRepositoryName !== ''){ -%><%= dockerID %>/<%= dockerRepositoryName %>:<%= projectName %>-srvjs<% }else{ -%><%= dockerID %>/<%= projectName %>-srvjs:latest<% } -%> -f srvjs/Dockerfile .
<% } -%>
<% } -%>
<% if(html5repo){ -%>
build-html5:
<% if(buildCmd === 'pack'){ -%>
	pack build <% if(dockerRepositoryName !== ''){ -%><%= dockerID %>/<%= dockerRepositoryName %>:<%= projectName %>-html5<% }else{ -%><%= dockerID %>/<%= projectName %>-html5:latest<% } -%> -p html5 -B paketobuildpacks/builder:base
<% }else{ -%>
	<%= buildCmd %> build --platform amd64 -t <% if(dockerRepositoryName !== ''){ -%><%= dockerID %>/<%= dockerRepositoryName %>:<%= projectName %>-html5<% }else{ -%><%= dockerID %>/<%= projectName %>-html5:latest<% } -%> -f html5/Dockerfile .
<% } -%>
<% } -%>
<% if((authentication || ui) && !managedAppRouter){ -%>
build-app:
<% if(buildCmd === 'pack'){ -%>
	pack build <% if(dockerRepositoryName !== ''){ -%><%= dockerID %>/<%= dockerRepositoryName %>:<%= projectName %>-app<% }else{ -%><%= dockerID %>/<%= projectName %>-app:latest<% } -%> -p app -B paketobuildpacks/builder:base
<% }else{ -%>
	<%= buildCmd %> build --platform amd64 -t <% if(dockerRepositoryName !== ''){ -%><%= dockerID %>/<%= dockerRepositoryName %>:<%= projectName %>-app<% }else{ -%><%= dockerID %>/<%= projectName %>-app:latest<% } -%> -f app/Dockerfile .
<% } -%>
<% } -%>

docker-push: build-cds<% if((hana || schemaName !== '' || hanaTargetHDI !== '') && !multiTenant){ -%> build-db<% } -%><% if(common){ -%> build-dbcommon<% } -%> build-srv<% if(srv2){ -%> build-srv2<% } -%><% if(srvjs){ -%> build-srvjs<% } -%><% if(html5repo){ -%> build-html5<% } -%><% if((authentication || ui) && !managedAppRouter){ -%> build-app<% } -%>

<% if((hana || schemaName !== '' || hanaTargetHDI !== '') && !multiTenant){ -%>
	<% if(buildCmd === 'podman'){ -%>podman<% }else{ -%>docker<% } -%> push <% if(dockerRepositoryName !== ''){ -%><%= dockerID %>/<%= dockerRepositoryName %>:<%= projectName %>-db<% }else{ -%><%= dockerID %>/<%= projectName %>-db:latest<% } -%>

<% } -%>
<% if(common){ -%>
	<% if(buildCmd === 'podman'){ -%>podman<% }else{ -%>docker<% } -%> push <% if(dockerRepositoryName !== ''){ -%><%= dockerID %>/<%= dockerRepositoryName %>:<%= projectName %>-dbcommon<% }else{ -%><%= dockerID %>/<%= projectName %>-dbcommon:latest<% } -%>

<% } -%>
	<% if(buildCmd === 'podman'){ -%>podman<% }else{ -%>docker<% } -%> push <% if(dockerRepositoryName !== ''){ -%><%= dockerID %>/<%= dockerRepositoryName %>:<%= projectName %>-srv<% }else{ -%><%= dockerID %>/<%= projectName %>-srv:latest<% } -%>

<% if(srv2){ -%>
	<% if(buildCmd === 'podman'){ -%>podman<% }else{ -%>docker<% } -%> push <% if(dockerRepositoryName !== ''){ -%><%= dockerID %>/<%= dockerRepositoryName %>:<%= projectName %>-srv2<% }else{ -%><%= dockerID %>/<%= projectName %>-srv2:latest<% } -%>

<% } -%>
<% if(srvjs){ -%>
	<% if(buildCmd === 'podman'){ -%>podman<% }else{ -%>docker<% } -%> push <% if(dockerRepositoryName !== ''){ -%><%= dockerID %>/<%= dockerRepositoryName %>:<%= projectName %>-srvjs<% }else{ -%><%= dockerID %>/<%= projectName %>-srvjs:latest<% } -%>

<% } -%>
<% if(html5repo){ -%>
	<% if(buildCmd === 'podman'){ -%>podman<% }else{ -%>docker<% } -%> push <% if(dockerRepositoryName !== ''){ -%><%= dockerID %>/<%= dockerRepositoryName %>:<%= projectName %>-html5<% }else{ -%><%= dockerID %>/<%= projectName %>-html5:latest<% } -%>

<% } -%>
<% if((authentication || ui) && !managedAppRouter){ -%>
	<% if(buildCmd === 'podman'){ -%>podman<% }else{ -%>docker<% } -%> push <% if(dockerRepositoryName !== ''){ -%><%= dockerID %>/<%= dockerRepositoryName %>:<%= projectName %>-app<% }else{ -%><%= dockerID %>/<%= projectName %>-app:latest<% } -%>

<% } -%>

helm-deploy:
<% if((hana || schemaName !== '' || hanaTargetHDI !== '') && !multiTenant){ -%>
	helm upgrade -n <%= namespace %> -i <%= projectName %>-db helm/<%= projectName %>-db --install<% if(kubeconfig !== ""){ -%> --kubeconfig <%= kubeconfig %><% } -%>

<% } -%>
<% if(common){ -%>
	helm upgrade -n <%= namespace %> -i <%= projectName %>-dbcommon helm/<%= projectName %>-dbcommon --install<% if(kubeconfig !== ""){ -%> --kubeconfig <%= kubeconfig %><% } -%>

<% } -%>
	helm upgrade -n <%= namespace %> -i <%= projectName %>-srv helm/<%= projectName %>-srv --install<% if(kubeconfig !== ""){ -%> --kubeconfig <%= kubeconfig %><% } -%>

<% if(srv2){ -%>
	helm upgrade -n <%= namespace %> -i <%= projectName %>-srv2 helm/<%= projectName %>-srv2 --install<% if(kubeconfig !== ""){ -%> --kubeconfig <%= kubeconfig %><% } -%>

<% } -%>
<% if(srvjs){ -%>
	helm upgrade -n <%= namespace %> -i <%= projectName %>-srvjs helm/<%= projectName %>-srvjs --install<% if(kubeconfig !== ""){ -%> --kubeconfig <%= kubeconfig %><% } -%>

<% } -%>
<% if(html5repo){ -%>
	helm upgrade -n <%= namespace %> -i <%= projectName %>-html5 helm/<%= projectName %>-html5 --install<% if(kubeconfig !== ""){ -%> --kubeconfig <%= kubeconfig %><% } -%>

<% } -%>
<% if((authentication || ui) && !managedAppRouter){ -%>
	helm upgrade -n <%= namespace %> -i <%= projectName %>-app helm/<%= projectName %>-app --install<% if(kubeconfig !== ""){ -%> --kubeconfig <%= kubeconfig %><% } -%>

<% } -%>

helm-undeploy:
<% if((authentication || ui) && !managedAppRouter){ -%>
	helm uninstall -n <%= namespace %> <%= projectName %>-app<% if(kubeconfig !== ""){ -%> --kubeconfig <%= kubeconfig %><% } -%>

<% } -%>
<% if(html5repo){ -%>
	helm uninstall -n <%= namespace %> <%= projectName %>-html5<% if(kubeconfig !== ""){ -%> --kubeconfig <%= kubeconfig %><% } -%>

<% } -%>
<% if(srvjs){ -%>
	helm uninstall -n <%= namespace %> <%= projectName %>-srvjs<% if(kubeconfig !== ""){ -%> --kubeconfig <%= kubeconfig %><% } -%>

<% } -%>
<% if(srv2){ -%>
	helm uninstall -n <%= namespace %> <%= projectName %>-srv2<% if(kubeconfig !== ""){ -%> --kubeconfig <%= kubeconfig %><% } -%>

<% } -%>
	helm uninstall -n <%= namespace %> <%= projectName %>-srv<% if(kubeconfig !== ""){ -%> --kubeconfig <%= kubeconfig %><% } -%>

<% if(common){ -%>
	helm uninstall -n <%= namespace %> <%= projectName %>-dbcommon<% if(kubeconfig !== ""){ -%> --kubeconfig <%= kubeconfig %><% } -%>

<% } -%>
<% if((hana || schemaName !== '' || hanaTargetHDI !== '') && !multiTenant){ -%>
	helm uninstall -n <%= namespace %> <%= projectName %>-db<% if(kubeconfig !== ""){ -%> --kubeconfig <%= kubeconfig %><% } -%>

<% } -%>