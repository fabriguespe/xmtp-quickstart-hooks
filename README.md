# XMTP React Hooks Quickstart

## Installation

```bash
bun install
bun start
```

## Concepts

Head to our docs to understand our hooks concepts with our react SDK

- [Get started](https://xmtp.org/docs/build/get-started?tab=rn)
- [Authentication](https://xmtp.org/docs/build/authentication?tab=rn)
- [Conversations](https://xmtp.org/docs/build/conversations?tab=rn)
- [Messages](https://xmtp.org/docs/build/messages/?tab=rn)
- [Streams](https://xmtp.org/docs/build/streams/?tab=rn)

#### Troubleshooting

If you get into issues with `Buffer` and `polyfills` check out the fix below:

1. Install the buffer dependency.

```bash
npm i buffer
```

2. Create a new file, `polyfills.js`, in the root of your project.

```tsx
import { Buffer } from "buffer";

window.Buffer = window.Buffer ?? Buffer;
```

3. Import it into your main file on the first line.

- ReacJS: `index.js` or `index.tsx`
- VueJS: `main.js`
- NuxtJS: `app.vue`

  <br/>

```tsx
//has to be on the first line of the file for it to work
import "./polyfills";
```

4. Update config files.

- Webpack: `vue.config.js` or `webpack.config.js`:

```jsx
const webpack = require("webpack");

module.exports = {
  configureWebpack: {
    plugins: [
      new webpack.ProvidePlugin({
        Buffer: ["buffer", "Buffer"],
      }),
    ],
  },
  transpileDependencies: true,
};
```

- Vite: `vite.config.js`:

```jsx
import { defineConfig } from "vite";
import { Buffer } from "buffer";

export default defineConfig({
  /**/
  define: {
    global: {
      Buffer: Buffer,
    },
  },
  /**/
});
```

- NuxtJS: `nuxt.config.js`:

```tsx
export default {
  build: {
    extend(config, { isClient }) {
      if (isClient) {
        config.node = {
          Buffer: true,
        };
      }
    },
  },
};
```
