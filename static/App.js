import { h, Component, render, Fragment } from "./ui-lib.js";

const root = document.getElementById("root");
const svgs = {
  IMAGE: h("img", { class: "ctype", src: "/static/image.svg" }),
  VIDEO: h("img", { class: "ctype", src: "/static/video.svg" }),
  AUDIO: h("img", { class: "ctype", src: "/static/audio.svg" })
};
class App extends Component {
  constructor() {
    super();
    this.state = {
      showForm: true,
      results: [],
      value: "",
      loading: false,
      error: null
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInput = this.handleInput.bind(this);
  }
  async handleSubmit() {
    const value = this.state.value;
    this.setState({ loading: true, error: null });
    let response;
    try {
      response = await fetch("/get?url=" + encodeURIComponent(value));
    } catch (e) {
      this.setState({ loading: false, error: "Couldn't Fetch" });
    }
    const json = await response.json();
    this.setState(ps => {
      const results = [json, ...ps.results];
      if (json.error) return { error: json.error, loading: false };

      return { results: results, loading: false, error: null };
    });
  }
  handleInput(e) {
    this.setState({ value: e.target.value });
  }
  render({}, state) {
    return h(
      Fragment,
      null,
      h(
        "form",
        { action: "javascript:", onSubmit: this.handleSubmit },
        h("input", {
          class: "enter-url",
          placeholder: "Enter a URL",
          onInput: this.handleInput,
          value: state.value
        }),
        h(
          "button",
          { class: "submit-button hoverable start-app-action" },
          "Submit"
        )
      ),
      state.error ? h("div", { style: { color: "red" } }, state.error) : null,
      state.loading ? h("div", null, "Loading") : null,
      state.results.length
        ? h("div", null, state.results.map(x => h(ResultParser, { data: x })))
        : null
    );
  }
}

render(h(App), root);

function normalizeURL(url, host) {
  if (!url) return null;
  return new URL(url, host).toString();
}
function ResultParser(props) {
  const data = props.data,
    host = data.host,
    cType = data["content-type"],
    title = data.title,
    site_name = data.site_name,
    type = data.type,
    image = data.image,
    description = data.description,
    audio = data.audio,
    locale = data.locale,
    video = data.video;
  const titleComponent = h(Title, { text: title });
  const siteNameComponent = h(SiteName, { text: site_name });
  const typeComponent = h(Type, { text: type });
  const imageComponent = h(Image_, { src: normalizeURL(image, host) });
  const descriptionComponent = h(Description, { text: description });
  const audioComponent = h(Audio_, { src: normalizeURL(audio, host) });
  const localeComponent = h(Locale, { text: locale });
  const videoComponent = h(Video, { src: normalizeURL(video, host) });
  const cTypeSvgURL =
    svgs[(cType || "").toUpperCase()] ||
    svgs[(type || "").toUpperCase()] ||
    null;

  return h(
    "div",
    { class: "box-result results-box" },
    h(
      "div",
      { class: "meta-initial" },
      titleComponent,
      siteNameComponent,
      typeComponent,
      localeComponent,
      cTypeSvgURL
    ),
    descriptionComponent,
    imageComponent,
    audioComponent,
    videoComponent
  );
}

function Audio_(props) {
  return props.src
    ? h("div", { class: "audio" }, "Audio:", h("audio", { src: props.src }))
    : null;
}
function Title(props) {
  return h("div", { class: "title" }, props.text || "No Title Found");
}

function Type(props) {
  return props.text
    ? h(
        "div",
        {
          style: { textAlign: "left", marginLeft: "15px", fontSize: "0.9rem" }
        },
        "Type:",
        h("span", { class: "site-type" }, props.text)
      )
    : null;
}
function SiteName(props) {
  return props.text ? h("div", { class: "site-name" }, props.text) : null;
}

function Image_(props) {
  if (!props.src) return null;
  return h(
    "div",
    { class: "image-box" },
    h("img", { width: 200, src: props.src, class: "demo-img" })
  );
}

function Description(props) {
  if (!props.text) return null;
  return h("div", { class: "description" }, props.text);
}

function Locale(props) {
  return props.text
    ? h("div", { class: "locale-en" }, "Language:", props.text)
    : null;
}
function Video(props) {
  if (!props.src) return null;
  return h(
    "div",
    { class: "video" },
    "Video:",
    h("video", {
      src: props.src,
      controls: true,
      style: { height: "200px", display: "block", margin: "auto" }
    })
  );
}
