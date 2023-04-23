DOCKER_COMPOSE= docker compose
CONTAINER_NAME= node-server

.PHONY: up down restart rm shell


up:
ifeq ($(file), dev)
	$(DOCKER_COMPOSE) -f $(file).yml up
else
	$(DOCKER_COMPOSE) -f $(file).yml up -d
endif

down:
	$(DOCKER_COMPOSE) -f $(file).yml down

restart:
	-make rm
	make up file=$(file)

rm:
	docker rm $(CONTAINER_NAME)

shell:
	docker exec -it $(CONTAINER_NAME) sh
