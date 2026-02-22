// maunium-stickerpicker - A fast and simple Matrix sticker picker widget.
// Copyright (C) 2020 Tulir Asokan
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.
//
// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

import { Component, html, render } from "../lib/htm/preact.js";
import { Settings } from "./Settings.js";
import { SearchBox } from "./SearchBox.js";
import { GifList } from "./GifList.js";

// THIS SHOULD NOT BE EXPOSED HERE?
const GIPHY_API_KEY = "HQku8974Uq5MZn3MZns46kXn2R4GDm75";
const GIPHY_MXC_PREFIX = "mxc://giphy.proxy/";
const ALLOWED_THEMES = ["light", "dark", "black"];

let widgetId = null

class App extends Component {
    constructor(props) {
        super(props);
        const params = new URLSearchParams(document.location.search);
        this.frequent_gifs = JSON.parse(window.localStorage.mauFrequentlyUsedStickerIDs || "[]");
        this.defaultTheme = params.get("theme");
        this.searchGifs = this.searchGifs.bind(this);
        this.sendGif = this.sendGif.bind(this);
        this.setTheme = this.setTheme.bind(this);
        this.setGifsPerRow = this.setGifsPerRow.bind(this);
        this.toggleSettings = this.toggleSettings.bind(this);
        this.state = {
            search: null,
            trending: {
                loading: true,
                error_msg: null,
                results: null
            },
            frequent: {
                loading: true,
                error_msg: null,
                results: null
            },
            theme: localStorage.mauStickerThemeOverride || this.defaultTheme,
            gifsPerRow: localStorage.mauStickersPerRow || "4",
        };

        if (!ALLOWED_THEMES.includes(this.state.theme)) {
            this.state.theme = "light";
        }

        if (!ALLOWED_THEMES.includes(this.defaultTheme)) {
            this.defaultTheme = "light";
        }
    }

    setTheme(theme) {
        if (theme === "default") {
            delete localStorage.mauStickerThemeOverride
            this.setState({ theme: this.defaultTheme })
        } else {
            localStorage.mauStickerThemeOverride = theme
            this.setState({ theme: theme })
        }
    }

    setGifsPerRow(val) {
        localStorage.mauStickersPerRow = val;
        document.documentElement.style.setProperty("--stickers-per-row", val);
        this.setState({
            gifsPerRow: val
        });
    }

    toggleSettings() {
        this.setState({settings: !this.state.settings});
    }

    componentDidMount() {
        this.setGifsPerRow(this.state.gifsPerRow);
        this.updateFrequentGifs();
        this.updateTrendingGifs();
    }

    async updateTrendingGifs() {
        // this.setState({
        //     trending: {
        //         loading: true,
        //         error_msg: null,
        //         results: null,
        //     }
        // });

        // try {
        //     const resp = await fetch(`https://api.giphy.com/v1/gifs/trending?api_key=${GIPHY_API_KEY}`);
        //     // TODO handle error responses properly?
        //     const data = await resp.json();
        //     if (data.data.length === 0) {
        //         this.setState({
        //             trending: {
        //                 loading: false,
        //                 error_msg: "No Results",
        //                 results: [],
        //             }
        //         });
        //     } else {
        //         this.setState({
        //             trending: {
        //                 loading: false,
        //                 error_msg: null,
        //                 results: data.data,
        //             }
        //         });
        //     }
        // } catch (error) {
        //     this.setState({
        //         trending: {
        //             loading: false,
        //             error_msg: error,
        //             results: [],
        //         }
        //     });
        // }
    }

    async searchGifs(search_text) {
        if (!search_text || search_text.length === 0) {
            this.setState({ search: null });
        } else {
            this.setState({
                search: {
                    loading: true,
                    error_msg: null,
                    results: null,
                }
            });
            try {
                const resp = await fetch(`https://api.giphy.com/v1/gifs/search?q=${search_text}&api_key=${GIPHY_API_KEY}`);
                // TODO handle error responses properly?
                const data = await resp.json();
                if (data.data.length === 0) {
                    this.setState({
                        search: {
                            loading: false,
                            error_msg: "No Results",
                            results: [],
                        }
                    });
                } else {
                    this.setState({
                        search: {
                            loading: false,
                            error_msg: null,
                            results: data.data,
                        }
                    });
                }
            } catch (error) {
                this.setState({
                    search: {
                        loading: false,
                        error_msg: error,
                        results: [],
                    }
                });
            }
        }
    }

    updateFrequentGifs(gif = null) {
        if (gif !== null) {
            let gif_data = this.frequent_gifs.find(([,,gif]) => gif.id == gif.id);
            if (!gif_data) {
                gif_data = [0, Date.now(), gif];
                this.frequent_gifs.push(gif_data);
            }

            gif_data[0] = gif_data[0] + 1;
            gif_data[1] = Date.now();
            this.frequent_gifs = this.frequent_gifs
                .sort(([count1, date1], [count2, date2]) => count2 === count1 ? date2 - date1 : count2 - count1)
                .slice(0, 200);
            window.localStorage.mauFrequentlyUsedStickerIDs = JSON.stringify(this.frequent_gifs);
        }

        this.setState({
            frequent: {
                loading: false,
                error_msg: this.frequent_gifs.length === 0 ? "You have not used any gifs yet..." : null,
                results: this.frequent_gifs.slice(0, 16).map(([,,gif]) => gif),
            }
        });
    }

    sendGif(gif) {
        const data = {
            content: {
                "body": gif.title,
                "info": {
                    "h": +gif.images.original.height,
                    "w": +gif.images.original.width,
                    "size": +gif.images.original.size,
                    "mimetype": "image/webp",
                },
                "msgtype": "m.image",
                "url": GIPHY_MXC_PREFIX + gif.id,

                "id": gif.id,
                "filename": gif.id + ".webp",
            },
            // `name` is for Element Web (and also the spec)
            // Element Android uses content -> body as the name
            name: gif.title,
        }
        // Custom field that stores the ID even for non-telegram stickers
        delete data.content.id

        // This is for Element iOS
        const widgetData = {
            ...data,
            description: gif.title,
            file: gif.id + ".webp"
        }
        delete widgetData.content.filename
        // Element iOS explodes if there are extra fields present
        delete widgetData.content["net.maunium.telegram.sticker"]

        window.parent.postMessage({
            api: "fromWidget",
            action: "m.sticker",
            requestId: `sticker-${Date.now()}`,
            widgetId,
            data,
            widgetData,
        }, "*");
        this.updateFrequentGifs(gif);
    }

    render() {
        const theme = `theme-${this.state.theme}`;
        return (html`
            <main class="${theme}">
                <${SearchBox} liveSearchInterval=${750} onSearch=${this.searchGifs} />
                <div class="pack-list">
                    ${this.state.search === null && html`<h3>Frequent Gifs</h3>`}
                    ${this.state.search === null && html`<${GifList} state=${this.state.frequent} onGifClick=${this.sendGif} />`}
                    ${this.state.search === null && html`<h3>Trending Gifs</h3>`}
                    ${this.state.search === null && html`<${GifList} state=${this.state.trending} onGifClick=${this.sendGif} />`}
                    ${this.state.search !== null && html`<${GifList} state=${this.state.search} onGifClick=${this.sendGif} />`}
                    <h3>Settings</h3>
                    <${Settings} stickersPerRow=${this.state.gifsPerRow} updateStickersPerRow=${this.setGifsPerRow} theme=${this.state.theme} setTheme=${this.setTheme} />
                </div>
            </main>`);
    }
}

window.onmessage = event => {
    if (!window.parent || !event.data) {
        return
    }

    const request = event.data
    if (!request.requestId || !request.widgetId || !request.action || request.api !== "toWidget") {
        return
    }

    if (widgetId) {
        if (widgetId !== request.widgetId) {
            return
        }
    } else {
        widgetId = request.widgetId
    }

    let response

    if (request.action === "visibility") {
        response = {}
    } else if (request.action === "capabilities") {
        response = { capabilities: ["m.sticker"] }
    } else {
        response = { error: { message: "Action not supported" } }
    }

    window.parent.postMessage({ ...request, response }, event.origin);
};

render(html`<${App}/>`, document.body);
