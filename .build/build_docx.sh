#!/bin/bash
# 공모제출서식.md → docx 빌드 (표 폭 고정 · 한글 폰트 · 10pt)
set -e
cd "$(dirname "$0")/.."
[ -f /tmp/reference2.docx ] || python3 .build/ref.py
python3 .build/prep.py
pandoc /tmp/proposal.md -o "부대활동_기상_위험성평가_지원체계_공모제출서식.docx" \
  --reference-doc=/tmp/reference2.docx --resource-path=.
python3 .build/fixtbl.py "$(pwd)/부대활동_기상_위험성평가_지원체계_공모제출서식.docx"
echo "빌드 완료"
