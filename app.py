import json

import requests
from bs4 import BeautifulSoup as bs
from flask import Flask, Response, render_template, request

from URL import URL

app = Flask(__name__)

data_dict = {
    "title": ["title", "og:title"],
    "site_name": ["site_name", "og:site_name"],
    "type": ["og:type", "type"],
    "image": ["og:image", "image", "og:image:url", "og:image:secure_url"],
    "description": ["description", "og:description"],
    "audio": ["og:audio", "og:audio:secure_url"],
    "locale": ["og:locale", "language"],
    "video": ["og:video", "og:video:secure_url"],
}
META = "meta"
PROP_TITLES = "itemprop|name|property|id".split("|")


def get_content_type(ct):
    if "image" in ct:
        return "IMAGE"
    if "text" in ct:
        return "TEXT"
    if "video" in ct:
        return "VIDEO"
    if "audio" in ct:
        return "AUDIO"
    return "UNKNOWN"


UA_d = "Mozilla/5.0 (Windows NT 10.0; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/67.0.3526.73 Safari/537.36"
basic_headers = {
    "Accept-Encoding": "gzip, deflate",
    "User-Agent": UA_d,
    "Upgrade-Insecure-Requests": "1",
    "Accept-Language": "en-GB,en-US;q=0.9,en;q=0.8",
    "dnt": "1",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
}


def _abort_request_after(url, byte_len=1024):
    with requests.get(
        url, headers=basic_headers, allow_redirects=True, stream=True
    ) as chunk:
        for _ in chunk.iter_content(byte_len):
            headers = chunk.headers
            chunk.close()
    return headers


def get_head_meta_data(url):
    try:
        ret = requests.head(url, headers=basic_headers, allow_redirects=True).headers
    except:
        ret = _abort_request_after(url)
    print(ret)
    return ret


error_dict = {"error": "not_html"}

INVALIDATE_WHEN_NOT_HTML = False


def get_meta_data_json(url, parsed):
    if INVALIDATE_WHEN_NOT_HTML:
        meta = get_head_meta_data(url)
        if "html" not in meta.get("content-type", "").lower():
            return error_dict
    try:
        page = requests.get(url)
    except:
        return {"error": "Invalid Response"}
    headers = page.headers
    soup = bs(page.text, features="html.parser")
    # meta_tags = soup.find_all("meta")
    title = soup.find("title")
    ret_json = {"title": title.text if title else None}
    for k, v in data_dict.items():
        for prop in v:
            for title in PROP_TITLES:
                obj = soup.find("meta", attrs={title: prop})
                if obj:
                    ret_json[k] = obj.attrs.get("content")
    content_type = get_content_type(
        headers.get("content-type", "").split(";")[0].lower()
    )
    ret_json["content-type"] = content_type
    ret_json["host"] = parsed.proto + "://" + parsed.host
    return ret_json


@app.route("/")
def index():
    return render_template("index.html")


def json_resp(dc):
    return Response(json.dumps(dc), content_type="application/json")


@app.route("/get/", strict_slashes=False)
def get_resp():
    _url = request.args.get("url")
    if not _url:
        return json_resp({"error": "invalid_url"})
    url = URL(_url)
    n = str(url)
    return json_resp(get_meta_data_json(n, url))


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")

