# Cloudflare: `business.pirttrip.com` DNS

Railway shows a **yellow warning** on the CNAME until DNS is correct. TXT verify alone is not enough.

## 1. Railway (already done)

Custom domain: `business.pirttrip.com`  
CNAME target (example — copy yours from Railway):

```text
ve94qty1.up.railway.app
```

## 2. Cloudflare DNS

Open **Cloudflare → pirttrip.com → DNS → Records**

| Type | Name | Content | Proxy |
|------|------|---------|--------|
| **CNAME** | `business` | `ve94qty1.up.railway.app` (from Railway) | **DNS only** (grey cloud) first |
| TXT | `_railway-verify.business` | (from Railway) | — |

- **Name** must be `business`, not `business.pirttrip.com` (Cloudflare adds the root).
- After it works, you may turn proxy (orange cloud) back on.

## 3. Verify

```bash
dig business.pirttrip.com CNAME +short
# should print: ve94qty1.up.railway.app.
```

Browser: `https://business.pirttrip.com/` → partner landing (same as old `/business`).

## 4. Redeploy frontend

After DNS is green in Railway, **Redeploy** the Nuxt frontend service so route rules and host detection are current.

## 5. Custom domain limit (Railway)

If Railway shows *“custom domain limit for your plan”*, either upgrade or remove an unused custom domain on that service so `business.pirttrip.com` stays active.

## Troubleshooting

| Symptom | Fix |
|---------|-----|
| `DNS_PROBE_FINISHED_NXDOMAIN` | CNAME `business` missing or not propagated |
| Wrong page (main homepage) | Purge Cloudflare cache; redeploy frontend |
| Railway CNAME still yellow | Wait 5–30 min; confirm CNAME name/target |
