import urllib.request

# Verify ALL remaining CDN URLs
urls = [
    "https://cdn.simpleicons.org/anthropic/white",
    "https://cdn.simpleicons.org/googlegemini/white",
    "https://cdn.simpleicons.org/meta/white",
    "https://cdn.simpleicons.org/nextdotjs/white",
    "https://cdn.simpleicons.org/postgresql/white",
    "https://cdn.simpleicons.org/typescript/white",
    "https://cdn.simpleicons.org/framer/white",
    "https://cdn.simpleicons.org/letsencrypt/white",
    "https://cdn.simpleicons.org/auth0/white",
    "https://cdn.simpleicons.org/mysql/white",
    "https://cdn.simpleicons.org/mongodb/white",
    "https://cdn.simpleicons.org/appwrite/white",
    "https://cdn.simpleicons.org/firebase/white",
    "https://cdn.simpleicons.org/sqlite/white",
    "https://cdn.simpleicons.org/mariadb/white",
    "https://cdn.simpleicons.org/cockroachlabs/white",
    "https://cdn.simpleicons.org/tailwindcss/white",
]
ok = 0
fail = 0
for url in urls:
    try:
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        resp = urllib.request.urlopen(req, timeout=10)
        resp.read()
        ok += 1
    except Exception as e:
        fail += 1
        print("FAIL - " + url + " - " + str(e))
print(str(ok) + "/" + str(ok+fail) + " URLs OK, " + str(fail) + " failed")
