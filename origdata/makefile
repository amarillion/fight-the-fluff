# Set shell to bash instead of sh allow for brace expansion
SHELL=/bin/bash

DEST=../assets/images
SRC=.

.PHONY: default
default: all ;

BUN_LAYERS=Ship Fluff_front1 Banana_1 BananaBox projectile
BUN_FILES=$(patsubst %,$(DEST)/%.png,$(BUN_LAYERS))
	
$(BUN_FILES): $(DEST)/%.png: $(SRC)/%.aseprite
	aseprite -b $< --sheet $@

.PHONY: all
all: $(BUN_FILES)
