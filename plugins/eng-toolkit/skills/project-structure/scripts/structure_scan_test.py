#!/usr/bin/env python3
"""structure_scan.py 가 언어별 import 를 맞게 해석하고 다섯 가지 신호를 내는지 확인한다.

    python3 scripts/structure_scan_test.py

임시 디렉터리에 작은 저장소를 언어마다 하나씩 만들어 돌린다. Stop 훅이 verify.sh 를
통해 응답마다 부르므로, 픽스처는 신호 하나를 드러내는 데 필요한 최소 파일만 둔다.
"""
import contextlib
import io
import os
import shutil
import subprocess
import sys
import tempfile

HERE = os.path.dirname(os.path.abspath(__file__))
sys.dont_write_bytecode = True
sys.path.insert(0, HERE)
import structure_scan as scan  # noqa: E402

FAILS = []


def check(name, cond, detail=""):
    if not cond:
        FAILS.append(f"FAIL {name}" + (f" — {detail}" if detail else ""))


def write(root, files):
    for rel, text in files.items():
        p = os.path.join(root, rel)
        os.makedirs(os.path.dirname(p), exist_ok=True)
        with open(p, "w", encoding="utf-8") as fh:
            fh.write(text)


def run(root, *extra):
    return scan.analyze(scan.parser().parse_args([root, "--no-git", *extra]))


def edge(r, a, b):
    return b in r["edges"].get(a, {})


def cyc(r):
    return [set(c["modules"]) for c in r["cycles"]]


def ts_case(tmp):
    root = os.path.join(tmp, "ts")
    write(root, {
        "tsconfig.json": '{\n  // 주석과 끝 쉼표를 견뎌야 한다\n  "compilerOptions": {"baseUrl": ".", "paths": {"@/*": ["src/*"],},},\n}\n',
        "vite.config.ts": "export default {}\n",
        "src/app/main.ts": "import { Cart } from '@/features/cart'\nimport { place } from '../features/order'\nimport '@/features/cart/ui'\n",
        "src/features/cart/index.ts": "export * from './model'\n",
        "src/features/cart/model.ts": "import { won } from '@/shared/money'\nexport const Cart = won\n",
        "src/features/cart/ui/index.ts": "import { place } from '@/features/order'\n",
        "src/features/order/index.ts": "import { Cart } from '@/features/cart/model'\nimport { d } from '@/shared/date'\nexport const place = 1\n",
        "src/shared/money.ts": "export const won = (n: number) => n\n",
        "src/shared/date.ts": "export const d = 1\n",
        "src/shared/leak.ts": "import { place } from '@/features/order'\n",
        "src/features/order/order.test.ts": "import { x } from '@/app/main'\n",
    })
    r = run(root)
    check("ts 모듈 이름", {"app", "features/cart", "features/order", "shared"} <= set(r["modules"]),
          str(r["modules"]))
    check("ts 경로 별칭 해석", edge(r, "features/cart", "shared"))
    check("ts 상대 경로 해석", edge(r, "app", "features/order"))
    check("ts 순환", any({"features/cart", "features/order"} <= c for c in cyc(r)), str(cyc(r)))
    check("ts 기본 규칙: 공통이 기능을 import",
          any(v["from"] == "shared" and v["to"] == "features/order" for v in r["violations"]),
          str(r["violations"]))
    check("ts 공개 표면 우회",
          any(a == "features/order" and t == "src/features/cart/model.ts" for a, _, _, _, t in r["deep"]),
          str(r["deep"]))
    check("ts 하위 index 는 공개 표면이 아니다",
          "src/features/cart/ui/index.ts" in scan_entries(r), str(r["deep"]))
    check("ts 한 곳 전용 공통 파일", ("src/shared/date.ts", "features/order") in r["single"], str(r["single"]))
    check("ts 테스트 제외", not edge(r, "features/order", "app"))

    write(root, {".structure-rules": "# 기능끼리는 직접 import 하지 않는다\n"
                                     "deny features/* -> features/*   # 상위에서 조립\n"
                                     "allow features/order -> features/cart\n"})
    r = run(root)
    pairs = {(v["from"], v["to"]) for v in r["violations"]}
    check("ts 규칙 deny", ("features/cart", "features/order") in pairs, str(pairs))
    check("ts 규칙 allow 예외", ("features/order", "features/cart") not in pairs, str(pairs))
    check("ts 규칙 파일이 있으면 기본 규칙은 끈다", ("shared", "features/order") not in pairs)
    with contextlib.redirect_stdout(io.StringIO()):
        code = scan.main([root, "--no-git", "--fail-on", "cycle"])
    check("ts --fail-on 은 순환이 있으면 1", code == 1)
    return root


def scan_entries(r):
    return {t for _, _, _, _, t in r["deep"]}


def py_case(tmp):
    root = os.path.join(tmp, "py")
    write(root, {
        "pyproject.toml": "[project]\nname='shop'\n",
        "src/shop/__init__.py": "",
        "src/shop/orders/__init__.py": "",
        "src/shop/orders/service.py": "from shop.billing.invoice import make\nimport os\n",
        "src/shop/billing/__init__.py": "",
        "src/shop/billing/invoice.py": "from ..orders import service\n\ndef make():\n    pass\n",
        "tests/test_orders.py": "from shop.orders import service\n",
    })
    r = run(root)
    check("py 공통 접두 걷어냄", r["prefix"] == "shop", r["prefix"])
    check("py 절대 import", edge(r, "orders", "billing"), str(dict(r["edges"])))
    check("py 상대 import", edge(r, "billing", "orders"))
    check("py 순환", {"orders", "billing"} in cyc(r))


def go_case(tmp):
    root = os.path.join(tmp, "go")
    write(root, {
        "go.mod": "module example.com/app\n\ngo 1.22\n",
        "cmd/api/main.go": 'package main\n\nimport "example.com/app/internal/order"\n',
        "internal/order/order.go": 'package order\n\nimport (\n\t"fmt"\n\tpay "example.com/app/internal/payment"\n)\n',
        "internal/payment/payment.go": "package payment\n",
    })
    r = run(root)
    check("go 모듈 이름", {"cmd/api", "internal/order", "internal/payment"} <= set(r["modules"]), str(r["modules"]))
    check("go 단일 import", edge(r, "cmd/api", "internal/order"))
    check("go 블록·별칭 import", edge(r, "internal/order", "internal/payment"))
    check("go 순환 없음", not r["cycles"])


def jvm_case(tmp):
    root = os.path.join(tmp, "jvm")
    write(root, {
        "src/main/java/com/acme/shop/order/OrderService.java":
            "package com.acme.shop.order;\n\nimport com.acme.shop.payment.PaymentClient;\nimport java.util.List;\n",
        "src/main/java/com/acme/shop/order/Order.java": "package com.acme.shop.order;\n",
        "src/main/kotlin/com/acme/shop/payment/PaymentClient.kt":
            "package com.acme.shop.payment\n\nimport com.acme.shop.order.Order\n",
    })
    r = run(root)
    check("jvm 공통 패키지 걷어냄", set(r["modules"]) == {"order", "payment"}, str(r["modules"]))
    check("jvm 순환", {"order", "payment"} in cyc(r))


def git_case(root):
    if not shutil.which("git"):
        return
    g = ["git", "-C", root, "-c", "user.name=t", "-c", "user.email=t@t", "-c", "commit.gpgsign=false"]
    subprocess.run(g[:3] + ["init", "-q"], check=True)
    subprocess.run(g + ["add", "-A"], check=True)
    subprocess.run(g + ["commit", "-qm", "init"], check=True)
    for i in range(3):
        for rel in ("src/shared/date.ts", "src/app/main.ts"):
            with open(os.path.join(root, rel), "a") as fh:
                fh.write(f"// {i}\n")
        subprocess.run(g + ["commit", "-qam", f"c{i}"], check=True)
    r = scan.analyze(scan.parser().parse_args([root, "--max-commits", "50"]))
    co = r["co"]
    check("git 변경 결합", co is not None and co[2].get(("app", "shared"), 0) >= 3,
          str(co and dict(co[2])))
    text = scan.report(r, 8)
    check("git import 없는 결합 표시", "app + shared" in text and "import 없음" in text, text[-400:])


def main():
    tmp = tempfile.mkdtemp(prefix="structure-scan-")
    try:
        ts_root = ts_case(tmp)
        py_case(tmp)
        go_case(tmp)
        jvm_case(tmp)
        git_case(ts_root)
    finally:
        shutil.rmtree(tmp, ignore_errors=True)
    for f in FAILS:
        print(f)
    print(f"structure_scan: {'실패 ' + str(len(FAILS)) + '건' if FAILS else '통과'}")
    return 1 if FAILS else 0


if __name__ == "__main__":
    sys.exit(main())
