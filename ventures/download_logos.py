import urllib.request, os

slugs = {
    "vercel": "vercel",
    "supabase": "supabase",
    "linear": "linear",
    "prisma": "prisma",
    "railway": "railway",
    "resend": "resend",
    "neon": "neon",
    "turso": "turso",
    "clerk": "clerk",
    "convex": "convex",
    "axiom": "axiom",
    "triggerdotdev": "triggerdotdev",
    "inngest": "inngest",
    "tinybird": "tinybird",
    "upstash": "upstash",
    "warp": "warp",
    "dub": "dub",
    "caldotcom": "caldotcom",
    "openai": "openai",
    "anthropic": "anthropic",
    "replicate": "replicate",
    "huggingface": "huggingface",
    "langchain": "langchain",
    "datadog": "datadog",
    "cloudflare": "cloudflare",
    "hashicorp": "hashicorp",
    "figma": "figma",
    "notion": "notion",
    "loom": "loom",
    "stripe": "stripe",
    "plaid": "plaid",
    "planetscale": "planetscale",
    "segment": "segment",
    "github": "github",
    "heroku": "heroku",
    "mulesoft": "mulesoft",
    "sendgrid": "sendgrid",
}

outdir = "public/logos"
os.makedirs(outdir, exist_ok=True)

ok, fail = [], []
for key, slug in slugs.items():
    url = f"https://cdn.simpleicons.org/{slug}/white"
    path = os.path.join(outdir, f"{key}.svg")
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        resp = urllib.request.urlopen(req)
        data = resp.read()
        if len(data) < 100:
            fail.append(key)
        else:
            with open(path, "wb") as f:
                f.write(data)
            ok.append(key)
    except Exception:
        fail.append(key)

print("OK:", ", ".join(sorted(ok)))
print("FAIL:", ", ".join(sorted(fail)))
print(f"{len(ok)} succeeded, {len(fail)} failed")
