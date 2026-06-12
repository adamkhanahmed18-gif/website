#!/usr/bin/env python3
"""Comprehensive test suite for Ghafoors Immigration website.
Checks structure, links, images, accessibility basics, and information consistency.
"""
import os, re, glob, html
from html.parser import HTMLParser
from collections import defaultdict

ROOT = os.path.dirname(os.path.abspath(__file__))
os.chdir(ROOT)

HTML_FILES = sorted(glob.glob("*.html"))
IMAGE_FILES = set(os.listdir("images")) if os.path.isdir("images") else set()
ALL_LOCAL_FILES = set(os.listdir(".")) | {f"images/{i}" for i in IMAGE_FILES}

passed = 0
failed = 0
warnings = 0
failures = []
warns = []

def check(cond, msg):
    global passed, failed
    if cond:
        passed += 1
    else:
        failed += 1
        failures.append(msg)

def warn(cond, msg):
    global warnings
    if not cond:
        warnings += 1
        warns.append(msg)

def read(f):
    with open(f, encoding="utf-8") as fh:
        return fh.read()

# ---------- 1. Tag balance parser ----------
VOID = {"area","base","br","col","embed","hr","img","input","link","meta",
        "param","source","track","wbr","polyline","line","circle","path",
        "polygon","rect","stop","use","ellipse"}

class TagBalanceParser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.stack = []
        self.errors = []
        self.in_svg = 0
    def handle_starttag(self, tag, attrs):
        if tag == "svg": self.in_svg += 1
        if tag in VOID: return
        if self.in_svg and tag not in ("svg",): return
        self.stack.append(tag)
    def handle_endtag(self, tag):
        if tag == "svg":
            self.in_svg = max(0, self.in_svg - 1)
        if tag in VOID: return
        if self.in_svg and tag not in ("svg",): return
        if not self.stack:
            self.errors.append(f"closing </{tag}> with empty stack"); return
        if self.stack[-1] == tag:
            self.stack.pop()
        elif tag in self.stack:
            # pop until matched
            while self.stack and self.stack[-1] != tag:
                self.stack.pop()
            if self.stack: self.stack.pop()
        else:
            self.errors.append(f"unexpected </{tag}>")

for f in HTML_FILES:
    content = read(f)
    p = TagBalanceParser()
    try:
        p.feed(content)
    except Exception as e:
        check(False, f"[{f}] HTML parse exception: {e}")
        continue
    check(len(p.errors) == 0, f"[{f}] tag balance: {p.errors[:3]}")
    check(len(p.stack) == 0, f"[{f}] unclosed tags: {p.stack[:5]}")

# ---------- 2. Required head elements ----------
for f in HTML_FILES:
    c = read(f)
    check("<!DOCTYPE html>" in c or "<!doctype html>" in c.lower(), f"[{f}] missing DOCTYPE")
    check('charset="UTF-8"' in c or 'charset="utf-8"' in c, f"[{f}] missing charset")
    check('name="viewport"' in c, f"[{f}] missing viewport meta")
    check("<title>" in c and "</title>" in c, f"[{f}] missing title")
    check('name="description"' in c, f"[{f}] missing meta description")
    check('rel="stylesheet" href="styles.css"' in c, f"[{f}] missing styles.css link")
    check('lang="en"' in c, f"[{f}] missing lang attribute")

# ---------- 3. Internal link targets exist ----------
for f in HTML_FILES:
    c = read(f)
    for m in re.finditer(r'href="([^"]+)"', c):
        href = m.group(1)
        if href.startswith(("http://","https://","mailto:","tel:","#","data:")):
            continue
        target = href.split("#")[0].split("?")[0]
        if target == "":
            continue
        check(target in ALL_LOCAL_FILES or target in HTML_FILES,
              f"[{f}] broken internal link: {href}")

# ---------- 4. Image references exist ----------
for f in HTML_FILES:
    c = read(f)
    for m in re.finditer(r'src="(images/[^"]+)"', c):
        src = m.group(1)
        check(src in ALL_LOCAL_FILES, f"[{f}] missing image src: {src}")
    # CSS background images in styles.css
css = read("styles.css")
for m in re.finditer(r"url\(['\"]?(images/[^'\")]+)['\"]?\)", css):
    src = m.group(1)
    check(src in ALL_LOCAL_FILES, f"[styles.css] missing background image: {src}")

# ---------- 5. Every <img> has alt ----------
for f in HTML_FILES:
    c = read(f)
    for m in re.finditer(r"<img\b[^>]*>", c):
        tag = m.group(0)
        check('alt=' in tag, f"[{f}] <img> without alt: {tag[:80]}")

# ---------- 6. No emojis (standing rule) ----------
emoji_pat = re.compile(
    "[\U0001F300-\U0001FAFF\U00002600-\U000027BF\U0001F000-\U0001F02F\U0001F900-\U0001F9FF←-⇿⬀-⯿]"
)
for f in HTML_FILES:
    c = read(f)
    found = emoji_pat.findall(c)
    check(len(found) == 0, f"[{f}] emoji(s) found: {found[:5]}")

# ---------- 7. Information consistency ----------
WHATSAPP = "447306230049"
PHONE = "033 0133 3687"
EMAIL = "contact@ghafoors.uk"
LEGAL = "Ghafoors &amp; Ghafoor Limited"
IAA = "F201500982"
HOURS = "9:00am – 6:00pm"

for f in HTML_FILES:
    c = read(f)
    # WhatsApp number — no other numbers allowed
    bad_wa = [m for m in re.findall(r"wa\.me/(\d+)", c) if m != WHATSAPP]
    check(not bad_wa, f"[{f}] wrong WhatsApp number(s): {set(bad_wa)}")
    # Old phone numbers should not appear
    check("443301333687" not in c, f"[{f}] old WhatsApp 443301333687 present")
    check("11:00pm" not in c and "11pm" not in c, f"[{f}] leftover 11pm hours")
    check("7 days a week" not in c.lower(), f"[{f}] leftover '7 days a week'")
    # Legal name: if a copyright footer exists it must use the right legal entity
    if "&copy;" in c or "©" in c:
        check(LEGAL in c, f"[{f}] footer missing correct legal name")
        check("Ghafoors Immigration Lawyers Ltd" not in c, f"[{f}] old legal name 'Lawyers Ltd' present")
    # IAA ref consistency wherever an IAA ref number is cited
    if "IAA Ref" in c or "Ref No" in c:
        check(IAA in c, f"[{f}] IAA ref number missing/incorrect")

# ---------- 8. Footer hours consistency ----------
for f in HTML_FILES:
    c = read(f)
    if "footer" in c and ("am" in c.lower() and "pm" in c.lower()):
        if "Monday" in c:
            check("Monday–Friday" in c or "Monday-Friday" in c,
                  f"[{f}] footer day range not Monday–Friday")

# ---------- 9. Address fully removed (client went online-only) ----------
ADDRESS_TOKENS = ["Bronte House", "BD1 2HA", "BD1 2", "Bradford BD"]
for f in HTML_FILES:
    c = read(f)
    for tok in ADDRESS_TOKENS:
        check(tok not in c, f"[{f}] leftover address token: '{tok}'")

# ---------- 10. Nav dropdown completeness (all 9 services) ----------
SERVICES = {
    "partner-visas.html","skilled-worker.html","citizenship.html","ilr.html",
    "student-visas.html","sponsor-licence.html","citizenship-investment.html",
    "second-passport.html","refusal-challenge.html",
}
for f in HTML_FILES:
    c = read(f)
    # match dropdown whether or not it has extra attributes like role="menu"
    menu = re.search(r'<div class="nav-dropdown-menu"[^>]*>(.*?)</div>', c, re.S)
    check(menu is not None, f"[{f}] no desktop nav dropdown found")
    if menu:
        block = menu.group(1)
        for s in SERVICES:
            check(f'href="{s}"' in block, f"[{f}] desktop nav dropdown missing {s}")
    mobile = re.search(r'<nav class="mobile-nav-links"[^>]*>(.*?)</nav>', c, re.S)
    check(mobile is not None, f"[{f}] no mobile nav found")
    if mobile:
        block = mobile.group(1)
        for s in SERVICES:
            check(f'href="{s}"' in block, f"[{f}] mobile nav missing {s}")

# ---------- 11. Page hero background image present on inner pages ----------
HERO_CLASSES = {"hero-family","hero-work","hero-citizenship","hero-settlement","hero-business"}
for f in HTML_FILES:
    if f == "index.html":
        continue
    c = read(f)
    m = re.search(r'<section class="page-hero([^"]*)"', c)
    if m:
        classes = set(m.group(1).split())
        check(bool(classes & HERO_CLASSES),
              f"[{f}] page-hero has no background image class")

# ---------- 12. All 9 services have a hero image class defined in CSS ----------
for hc in HERO_CLASSES:
    check(f".page-hero.{hc}::before" in css, f"[styles.css] missing hero class rule .{hc}")

# ---------- 13. ICO badge on every page footer ----------
for f in HTML_FILES:
    c = read(f)
    check('class="ico-badge"' in c, f"[{f}] ICO badge missing")
    if 'class="ico-badge"' in c:
        check("ico.org.uk" in c, f"[{f}] ICO badge not linking to ico.org.uk")

# ---------- 14. Privacy policy links not placeholder ----------
for f in HTML_FILES:
    c = read(f)
    for m in re.finditer(r'<a href="(#?[^"]*)"[^>]*>\s*(Privacy Policy|Cookie Policy)\s*</a>', c):
        check(m.group(1) != "#", f"[{f}] {m.group(2)} link is placeholder '#'")

# ---------- 15. Homepage has all 9 service cards ----------
idx = read("index.html")
grid = re.search(r'<div class="grid-3">(.*?)</div>\s*<div class="text-center', idx, re.S)
if grid:
    block = grid.group(1)
    for s in SERVICES:
        check(f'href="{s}"' in block, f"[index.html] homepage services grid missing {s}")
else:
    check(False, "[index.html] could not locate homepage services grid")

# ---------- 16. PHP form wiring on contact page ----------
con = read("contact.html")
check('id="contact-form"' in con, "[contact.html] form missing id=contact-form")
check('name="botcheck"' in con, "[contact.html] form missing honeypot botcheck field")
js = read("script.js")
check("submit.php" in js, "[script.js] fetch not pointing to submit.php")

# ---------- 17. No raw stray TODO/lorem/placeholder text ----------
for f in HTML_FILES:
    c = read(f).lower()
    for bad in ["lorem ipsum","todo:","fixme","xxx ","placeholder text","coming soon"]:
        check(bad not in c, f"[{f}] stray '{bad}' text")

# ---------- 18. Title + description uniqueness ----------
titles = {}
descs = {}
for f in HTML_FILES:
    c = read(f)
    t = re.search(r"<title>(.*?)</title>", c, re.S)
    d = re.search(r'name="description" content="(.*?)"', c, re.S)
    if t: titles.setdefault(t.group(1).strip(), []).append(f)
    if d: descs.setdefault(d.group(1).strip(), []).append(f)
for t, fs in titles.items():
    warn(len(fs) == 1, f"duplicate <title> across {fs}: '{t[:50]}'")
for d, fs in descs.items():
    warn(len(fs) == 1, f"duplicate meta description across {fs}")

# ---------- 19. script.js + styles.css referenced ----------
for f in HTML_FILES:
    c = read(f)
    check('src="script.js"' in c, f"[{f}] missing script.js")

# ---------- 20. Bradford/online consistency (no physical visit invites) ----------
for f in HTML_FILES:
    c = read(f).lower()
    for bad in ["visit our office","come to our office","visit us at","drop in to"]:
        check(bad not in c, f"[{f}] in-person visit invite '{bad}' (client is online-only)")

# ---------- 21. Bradford only in real reviews (online-only rebrand) ----------
for f in HTML_FILES:
    c = read(f)
    if f == "reviews.html":
        continue  # real Google reviews legitimately mention Bradford
    check("Bradford" not in c, f"[{f}] 'Bradford' present (should be nationwide only)")

# ---------- 22. Footer taglines all identical ----------
tagvals = set()
for f in HTML_FILES:
    c = read(f)
    for m in re.finditer(r'class="footer-tagline">(.*?)</p>', c, re.S):
        tagvals.add(m.group(1).strip())
check(len(tagvals) <= 1, f"footer taglines not unified, variants: {tagvals}")

# ---------- 23. No 'hundreds' marketing claim conflicting with stats ----------
check("hundreds of families, workers" not in read("index.html"),
      "[index.html] hero still says 'hundreds' (should be 'thousands')")

# ---------- Report ----------
print("="*60)
print(f"  TEST RESULTS")
print("="*60)
print(f"  Files tested : {len(HTML_FILES)} HTML + styles.css + script.js")
print(f"  Checks passed: {passed}")
print(f"  Checks failed: {failed}")
print(f"  Warnings     : {warnings}")
print("="*60)
if failures:
    print("\nFAILURES:")
    for x in failures:
        print(f"  ✗ {x}")
if warns:
    print("\nWARNINGS (non-blocking):")
    for x in warns:
        print(f"  ! {x}")
if not failures:
    print("\n  ALL CRITICAL CHECKS PASSED ✓")
print()
