# Make sure the directory /dist/web-server exists
if (!(Test-Path -Path "./dist/web-server")) {
    New-Item -ItemType Directory -Path "./dist/web-server"
}

Remove-Item -Path "./dist/web-server/*" -Recurse -Force

# Copy the supabase_prod files
Copy-Item -Path "./supabase_prod/*" -Destination "./dist/web-server" -Recurse -Force

# Copy the config files
Copy-Item -Path "./config/*" -Destination "./dist/web-server" -Recurse -Force

# Build the docker container for the web server and output to /dist/web-server.tar
# docker build -t @stockedhome/web-server -f ./dockerfile
# docker save @stockedhome/web-server -o ./dist/web-server.tar
