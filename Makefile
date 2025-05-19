MAGENTA = \033[35m
BLEU_CLAIR = \033[36m 
RESET = \033[0m

all : up 

up :
	docker compose up --build

down : 
	docker compose down

downv : 
	docker compose down -v

oui : down up

dbclean :
	rm -rf services/chat/prisma/database services/chat/prisma/migrations
	rm -rf services/user/prisma/database services/user/prisma/migrations

tests :
	docker compose up --build -d
	docker exec -e FORCE_COLOR=1 tests npm test --force-color
	docker compose down

github :
	docker compose up --build -d
	sleep 30
	docker exec -e FORCE_COLOR=1 tests npm test --force-color
	docker compose down


check:
	@echo "$(MAGENTA)CONTAINER:$(RESET)"
	@docker ps -a
	@echo "$(BLEU_CLAIR)------------------------------------------------$(RESET)"
	@echo "$(MAGENTA)IMAGES:$(RESET)"
	@docker images
	@echo "$(BLEU_CLAIR)------------------------------------------------$(RESET)"
	@echo "$(MAGENTA)VOLUMES:$(RESET)"
	@docker volume ls

fclean : downv dbclean
	@rm -rf media/files/*
	@rm -rf services/*/node_modules/
	@rm -rf services/*/package-*
	@rm -rf services/*/.objs/
	@rm -rf services/user/node_modules
	@rm -rf gateway/node_modules
	@rm -rf gateway/.objs/
	@rm -rf backend/auth/node_modules/
	@rm -rf backend/user/.objs/
	@rm -rf frontend/node_modules/
	@rm -rf frontend/.objs
	@rm -rf tests/node_modules/
	@rm -rf tests/.objs/
	@rm -rf services/media/upload/*
	@rm -rf services/user/prisma/node_modules/
	docker system prune -af
	docker volume prune -af

log :
	docker compose logs -f

re : fclean all

retest : fclean tests

.PHONY : all up down fclean log re tests retest check oui dbclean