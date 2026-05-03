FROM golang:1.26.1 AS builder

WORKDIR /app

# Install Bun in the build stage so `bun run build` can build both TUI and Go server.
RUN apt-get update \
	&& apt-get install -y --no-install-recommends ca-certificates curl unzip \
	&& rm -rf /var/lib/apt/lists/*
RUN curl -fsSL https://bun.sh/install | bash
ENV BUN_INSTALL=/root/.bun
ENV PATH="${BUN_INSTALL}/bin:${PATH}"

# Copy manifests first to maximize Docker layer cache reuse.
COPY bun.lock package.json tsconfig.json go.mod go.sum ./
COPY packages/tui/package.json packages/tui/tsconfig.json packages/tui/biome.json ./packages/tui/

RUN bun install --frozen-lockfile
RUN go mod download

# Copy only the source trees needed by the build.
COPY cmd ./cmd
COPY internal ./internal
COPY packages/tui/script ./packages/tui/script
COPY packages/tui/src ./packages/tui/src

RUN bun run build

FROM debian:bookworm-slim AS runtime

WORKDIR /app

RUN apt-get update \
	&& apt-get install -y --no-install-recommends ca-certificates openssh-client \
	&& rm -rf /var/lib/apt/lists/*

# Runtime artifacts from the build stage.
COPY --from=builder /app/bin/sshd ./bin/sshd
COPY --from=builder /app/packages/tui/dist ./packages/tui/dist
COPY .env ./.env

# App expects .env and host key at startup.
RUN mkdir -p .ssh \
	&& case "$(uname -m)" in \
		x86_64) mono_pkg='@mono/tui-linux-x64' ;; \
		aarch64|arm64) mono_pkg='@mono/tui-linux-arm64' ;; \
		*) echo "unsupported architecture: $(uname -m)" >&2; exit 1 ;; \
	   esac \
	&& ln -sf "/app/packages/tui/dist/${mono_pkg}/bin/mono" /app/bin/mono \
	&& ssh-keygen -t ed25519 -f .ssh/id_ed25519 -N "" \
	&& if grep -q '^TUI_ENTRY=' .env; then \
		sed -i 's|^TUI_ENTRY=.*|TUI_ENTRY=/app/bin/mono|' .env; \
	else \
		echo 'TUI_ENTRY=/app/bin/mono' >> .env; \
	fi

EXPOSE 23234

CMD ["./bin/sshd"]