# Usage

`curl https://link-view.herokuapp.com/get?url={url}`

# Supported Tags

format: response_key: [possible,sources]
```
{
    "title": ["title", "og:title"],
    "site_name": ["site_name", "og:site_name"],
    "type": ["og:type", "type"],
    "image": ["og:image", "image", "og:image:url", "og:image:secure_url"],
    "description": ["description", "og:description"],
    "audio": ["og:audio", "og:audio:secure_url"],
    "locale": ["og:locale", "language"],
    "video": ["og:video", "og:video:secure_url"]
}
```
