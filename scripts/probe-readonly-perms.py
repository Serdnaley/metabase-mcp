#!/usr/bin/env python3
"""Probe what a restricted Metabase API key can do (exports vs writes).
Local test instance only. Usage: probe-readonly-perms.py [create-queries=no|query-builder|query-builder-and-native] [download=none|full]
Restores the All Users data permissions afterwards."""
import json, sys, urllib.request, urllib.error, copy, time
BASE = "http://localhost:3000"
ADMIN = json.load(open("/tmp/metabase-mcp-test-setup.json"))["apiKey"]
cq = sys.argv[1] if len(sys.argv) > 1 else "no"
dl = sys.argv[2] if len(sys.argv) > 2 else "full"
# third arg "keep-all-users": leave All Users untouched to see whether its grants leak to the key
keep_all = len(sys.argv) > 3 and sys.argv[3] == "keep-all-users"

def call(method, path, body=None, key=ADMIN, raw=False):
    data = json.dumps(body).encode() if body is not None else None
    req = urllib.request.Request(BASE + path, data=data, method=method,
                                 headers={"x-api-key": key, "content-type": "application/json"})
    try:
        with urllib.request.urlopen(req) as r:
            out = r.read()
            return r.status, (out[:80] if raw else (json.loads(out) if out else None))
    except urllib.error.HTTPError as e:
        return e.code, e.read()[:160].decode(errors="replace")

ts = int(time.time())
_, g = call("POST", "/api/permissions/group", {"name": f"ro-probe-{ts}"})
gid = g["id"]
_, graph = call("GET", "/api/permissions/graph")
orig_all_users = copy.deepcopy(graph["groups"]["1"])
perm = {"view-data": "unrestricted", "create-queries": cq, "download": {"schemas": dl}}
groups = {str(gid): {db: dict(perm) for db in graph["groups"]["1"]}}
if not keep_all: groups["1"] = {db: dict(perm) for db in graph["groups"]["1"]}
s, r = call("PUT", "/api/permissions/graph", {"revision": graph["revision"], "groups": groups})
print("set data perms", s, "" if s == 200 else r)
_, cg = call("GET", "/api/collection/graph")
cgroups = {str(gid): {"root": "read"}}
if not keep_all: cgroups["1"] = {"root": "read"}
orig_cg = copy.deepcopy(cg["groups"].get("1", {}))
s, r = call("PUT", "/api/collection/graph", {"revision": cg["revision"], "groups": cgroups})
print("set collection perms (root=read)", s, "" if s == 200 else r)
_, k = call("POST", "/api/api-key", {"name": f"ro-probe-{ts}", "group_id": gid})
ro = k["unmasked_key"]
_, card = call("POST", "/api/card", {"name": f"ro-probe-card-{ts}", "display": "table", "visualization_settings": {},
          "dataset_query": {"type": "native", "database": 1, "native": {"query": "SELECT 1 AS x"}}})
cid = card["id"]
native = {"type": "native", "database": 1, "native": {"query": "SELECT 2 AS y"}}
checks = [
    ("GET card", "GET", f"/api/card/{cid}", None, False),
    ("run card", "POST", f"/api/card/{cid}/query", {}, False),
    ("export card csv", "POST", f"/api/card/{cid}/query/csv", {}, True),
    ("ad-hoc SQL", "POST", "/api/dataset", native, False),
    ("export ad-hoc csv", "POST", "/api/dataset/csv", {"query": native}, True),
    ("create card (write)", "POST", "/api/card", {"name": "x", "display": "table", "visualization_settings": {}, "dataset_query": native}, False),
    ("rename card (write)", "PUT", f"/api/card/{cid}", {"name": "renamed"}, False),
    ("change setting (admin)", "PUT", "/api/setting/site-name", {"value": "probe"}, False),
]
print(f"\nkey group: create-queries={cq} download={dl}, collections root=read")
for label, m, p, b, raw in checks:
    s, r = call(m, p, b, key=ro, raw=raw)
    if m == "POST" and p == "/api/card" and s == 200: call("DELETE", f"/api/card/{r['id']}")
    print(f"{label:28s} {s} {'' if s in (200, 202) else str(r)[:110]}")
# restore + cleanup
_, graph = call("GET", "/api/permissions/graph")
print("restore data perms", call("PUT", "/api/permissions/graph", {"revision": graph["revision"], "groups": {"1": orig_all_users}})[0])
_, cg = call("GET", "/api/collection/graph")
print("restore collection perms", call("PUT", "/api/collection/graph", {"revision": cg["revision"], "groups": {"1": orig_cg or {"root": "write"}}})[0])
call("DELETE", f"/api/card/{cid}")
call("DELETE", f"/api/api-key/{k['id']}")
call("DELETE", f"/api/permissions/group/{gid}")
