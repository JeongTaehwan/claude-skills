# claude-skills 를 깐 Claude Code 를 컨테이너로 쓴다.
#
#   docker build -t claude-skills .                          # 전부
#   docker build -t claude-skills:base --build-arg PROFILE=base .   # 0 베이스
#   docker run -it --rm -e ANTHROPIC_API_KEY -v "$PWD":/workspace claude-skills
#
# 컨테이너 안은 새 집이라 settings.json 이 없다 — 그래서 여기서는 훅 등록까지 자동으로 한다
# (사람의 설정을 덮을 일이 없다). 호스트의 ~/.claude 는 건드리지 않는다.
FROM node:22-slim

RUN apt-get update \
 && apt-get install -y --no-install-recommends git python3 ca-certificates curl \
 && rm -rf /var/lib/apt/lists/*

ARG CLAUDE_CODE_VERSION=latest
RUN npm install -g @anthropic-ai/claude-code@${CLAUDE_CODE_VERSION}

# root 로 돌리지 않는다 — 권한 우회 옵션이 root 에서는 막히고, 마운트한 파일 소유자도 꼬인다.
USER node
WORKDIR /home/node/claude-skills
COPY --chown=node:node . .

ARG PROFILE=full
RUN ./sync.sh --profile "$PROFILE" --yes --register-hooks \
 && ./verify.sh

WORKDIR /workspace
ENTRYPOINT ["claude"]
