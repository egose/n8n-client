.PHONY: format asdf-install

format:
	black .

asdf-install:
	cat .tool-versions | cut -f 1 -d ' ' | xargs -n 1 asdf plugin add || true
	asdf plugin update --all
	@while IFS= read -r line; do \
		if [ -n "$$line" ] && [ "$${line#\#}" != "$$line" ]; then continue; fi; \
		tool=$$(echo $$line | awk '{print $$1}'); \
		version=$$(echo $$line | awk '{print $$2}'); \
		echo "Installing $$tool $$version..."; \
		asdf install $$tool $$version; \
	done < .tool-versions
	asdf reshim
