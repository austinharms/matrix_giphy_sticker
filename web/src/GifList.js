import { html } from "../lib/htm/preact.js";
import { Spinner } from "./Spinner.js";

export const GifList = ({ state, onGifClick }) => {
    const { loading, error_msg, results } = state;
    if (loading) {
        return (html`
            <section class="stickerpack" id="pack-giphy">
                <${Spinner} size=${40} green />
            </section>`);
    } else if (error_msg !== null) {
        return (html`
            <section class="empty" id="pack-giphy">
                <div class="error">${error_msg}</div>
            </section>`);
    } else {
        const stickers = results.map((gif) => html`
			<div class="sticker" onClick=${() => onGifClick(gif)} data-gif-id=${gif.id}>
				<img src=${gif.images.fixed_height.url} alt=${gif.title} class="visible" data=/>
			</div>`);
        return (html`
            <section class="stickerpack" id="pack-giphy">
                <div class="sticker-list">${stickers}</div>
            </section>`);
    }
};
