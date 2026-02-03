import asyncio
import httpx
from typing import Dict, Any, List
from datetime import datetime

from app.agents.agent_interface import AgentInterface
from app.llm_router import call_llm
from app.logger import get_logger

log = get_logger("ScraperAgent")


class ScraperAgent(AgentInterface):
    """
    Scrapes REAL CTI data (RAW FACTS ONLY) using:
    - CISA KEV
    - NVD
    - CERT-EU
    - TheHackerNews
    - TOR Dark Web (metadata)

    IMPORTANT:
    - NO severity assignment
    - NO confidence assignment
    """

    system_prompt = """
    You are a cyber threat intelligence enrichment agent.

    Input contains RAW threat records collected from authoritative sources.

    Rules:
    - Normalize wording only
    - Extract factual context only
    - DO NOT assign severity
    - DO NOT assign confidence
    - DO NOT invent threats or CVEs

    Output JSON only:
    {
      "raw_threats": [...]
    }
    """

    async def execute(self, input_data: Dict[str, Any]) -> Dict[str, Any]:
        query = input_data.get("query", "").lower()
        log.info(f"Scraping CTI for '{query}'")

        tasks = [
            self._fetch_cisa_kev(query),
            self._fetch_nvd_recent(query),
            self._fetch_cert_eu(query),
            self._fetch_thehackernews(query),
            self._fetch_tor_sources(query)
        ]

        results = await asyncio.gather(*tasks, return_exceptions=True)

        raw_threats: List[Dict[str, Any]] = []
        for r in results:
            if isinstance(r, list):
                raw_threats.extend(r)

        log.info(f"Raw threats collected: {len(raw_threats)}")

        if not raw_threats:
            return {**input_data, "raw_threats": []}

        # Optional AI enrichment (NO severity/confidence)
        try:
            ai_result = await call_llm(self.system_prompt, {"raw_threats": raw_threats})
            enriched = ai_result.get("raw_threats")
            if enriched:
                return {**input_data, "raw_threats": enriched}
        except Exception as e:
            log.warning(f"AI enrichment skipped: {str(e)}")

        return {**input_data, "raw_threats": raw_threats}

    # ------------------------------------------------------------------
    # CISA KEV
    # ------------------------------------------------------------------
    async def _fetch_cisa_kev(self, keyword: str) -> List[Dict[str, Any]]:
        url = "https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json"

        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(url)
            if resp.status_code != 200:
                return []

            data = resp.json()

        results = []
        for item in data.get("vulnerabilities", []):
            text = (
                (item.get("vendorProject") or "") +
                (item.get("product") or "") +
                (item.get("vulnerabilityName") or "")
            ).lower()

            if keyword in text:
                results.append({
                    "id": item.get("cveID"),
                    "title": item.get("vulnerabilityName"),
                    "threat_type": "Exploited Vulnerability",
                    "source": "CISA KEV",
                    "date": item.get("dateAdded")
                })
        return results

    # ------------------------------------------------------------------
    # NVD (RECENT CVEs)
    # ------------------------------------------------------------------
    async def _fetch_nvd_recent(self, keyword: str) -> List[Dict[str, Any]]:
        url = "https://services.nvd.nist.gov/rest/json/cves/2.0?resultsPerPage=200"

        async with httpx.AsyncClient(timeout=30) as client:
            resp = await client.get(url)
            if resp.status_code != 200:
                return []

            data = resp.json()

        results = []
        for item in data.get("vulnerabilities", []):
            cve = item.get("cve", {})
            descriptions = cve.get("descriptions", [])
            desc_text = " ".join(d.get("value", "") for d in descriptions).lower()

            if keyword and keyword not in desc_text:
                continue

            results.append({
                "id": cve.get("id"),
                "title": f"NVD CVE {cve.get('id')}",
                "threat_type": "Vulnerability",
                "source": "NVD",
                "date": cve.get("published")
            })

        return results

    # ------------------------------------------------------------------
    # CERT-EU (PUBLIC TITLES ONLY)
    # ------------------------------------------------------------------
    async def _fetch_cert_eu(self, keyword: str) -> List[Dict[str, Any]]:
        url = "https://www.cert.europa.eu/publications/"

        async with httpx.AsyncClient(timeout=25) as client:
            resp = await client.get(url)
            if resp.status_code != 200:
                return []

            html = resp.text.lower()

        results = []
        for line in html.splitlines():
            if keyword in line and "threat" in line:
                results.append({
                    "id": f"certeu_{hash(line)}",
                    "title": line.strip()[:120],
                    "threat_type": "Threat Advisory",
                    "source": "CERT-EU",
                    "date": datetime.utcnow().isoformat()
                })
        return results

    # ------------------------------------------------------------------
    # TheHackerNews
    # ------------------------------------------------------------------
    async def _fetch_thehackernews(self, keyword: str) -> List[Dict[str, Any]]:
        base_url = "https://thehackernews.com"
        search_url = f"{base_url}/search?q={keyword}"

        async with httpx.AsyncClient(timeout=25) as client:
            resp = await client.get(search_url)
            if resp.status_code != 200:
                return []

            html = resp.text

        results = []
        for line in html.splitlines():
            if "<a class=\"story-link\"" in line.lower():
                title = line.split(">")[-2].split("<")[0]
                results.append({
                    "id": title[:50].replace(" ", "_"),
                    "title": title,
                    "threat_type": "Security Incident",
                    "source": "TheHackerNews",
                    "date": datetime.utcnow().isoformat()
                })
        return results

    # ------------------------------------------------------------------
    # TOR DARK WEB (METADATA ONLY)
    # ------------------------------------------------------------------
    async def _fetch_tor_sources(self, keyword: str) -> List[Dict[str, Any]]:
        tor_urls = [
            "http://expyuzz4wqqyqhjn.onion/search?q=",
            "http://darkfailenbsdjsn.onion/search?q="
        ]

        proxies = {
            "http://": "socks5h://127.0.0.1:9050",
            "https://": "socks5h://127.0.0.1:9050"
        }

        results = []

        async with httpx.AsyncClient(proxies=proxies, timeout=40) as client:
            for base in tor_urls:
                try:
                    resp = await client.get(base + keyword)
                    if resp.status_code != 200:
                        continue

                    for line in resp.text.splitlines():
                        if keyword in line.lower():
                            results.append({
                                "id": f"tor_{hash(line)}",
                                "title": line.strip()[:120],
                                "threat_type": "Dark Web Mention",
                                "source": "TOR Dark Web",
                                "date": datetime.utcnow().isoformat()
                            })
                except Exception:
                    pass

        return results
