MAGENTA = \033[35m
BLEU_CLAIR = \033[36m 
RESET = \033[0m

all : up 

up :
	docker compose up --build

down : 
	docker compose down

oui : down up

check:
	@echo "$(MAGENTA)CONTAINER:$(RESET)"
	@docker ps -a
	@echo "$(BLEU_CLAIR)------------------------------------------------$(RESET)"
	@echo "$(MAGENTA)IMAGES:$(RESET)"
	@docker images
	@echo "$(BLEU_CLAIR)------------------------------------------------$(RESET)"
	@echo "$(MAGENTA)VOLUMES:$(RESET)"
	@docker volume ls

fclean : down
	docker system prune -af
	docker volume prune -af
	rm -rf backend/*/__pycache__/* || true
	rm -rf backend/*/*/__pycache__/*  || true
	@docker rmi $(shell docker images --filter "reference=postgres" --format "{{.ID}}") || true

dbclean : down
	docker volume prune -af
	@docker rmi $(shell docker images --filter "reference=postgres" --format "{{.ID}}") || true
	docker compose up --build

log :
	docker compose logs -f

re : fclean all

.PHONY : all up down fclean log re