docker run -d --name mongo-db-docker-heista -e MONGO_INITDB_ROOT_USERNAME=hestiaadmin -e MONGO_INITDB_ROOT_PASSWORD=duneglobal2002 -p 27017:27017 -v hestia-backend:/data/db mongo:7.0
