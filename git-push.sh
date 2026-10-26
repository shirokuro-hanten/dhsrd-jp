#!/bin/bash

cd "$(dirname "$0")" || exit 1

git status --short

git add .

if git diff --cached --quiet; then
  echo "コミットする変更はありません。"
else
  read -p "コミットメッセージ: " message
  git commit -m "$message" || exit 1
fi

git push || exit 1

echo "GitHubへの更新が完了しました。"
read -p "Enterキーで終了..."