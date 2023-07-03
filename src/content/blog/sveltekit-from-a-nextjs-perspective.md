---
title: SvelteKit From A NextJS Perspective
tags: [sveltekit, typescript]
pubDate: "Jan 18 2023"
image: /sveltekit.png
description: SvelteKit is built on Svelte, a UI framework that uses a compiler to let you write breathtakingly concise components that do minimal work in the browser.
---

The first thing you'll notice is the speed after typing `pnpm dev` it's ready almost 2x the speed of NextJS.

## Project Structure

Yes there are a lot of files, which can make you overwhelmed but you only need to care about the routes folder at first. It all makes sense after you mess around with it.

```bash
my-project/
├ src/
│ ├ lib/
│ │ ├ server/
│ │ │ └ [your server-only lib files]
│ │ └ [your lib files]
│ ├ params/
│ │ └ [your param matchers]
│ ├ routes/
│ │ └ [your routes]
│ ├ app.html
│ ├ error.html
│ └ hooks.js
├ static/
│ └ [your static assets]
├ tests/
│ └ [your tests]
├ package.json
├ svelte.config.js
├ tsconfig.json
└ vite.config.js
```

## Single File Components

The second thing you'll notice is styles, script and UI are all in the same file like in Vue, this makes it easier to seperate everything. No special JSX syntax required etc. CSS are scoped.

```html
<script>
  let hello = "hi";
</script>

<main>
  <h1>Hello</h1>
</main>

<style>
  main {
    background-color: red;
  }
</style>
```

## Layouts

The thing which I most loved is layouts, you can keep your parent layout and only change the child layout. I build a dashboard so this feature in NextJS is a pain to implement without layouts.

## Reactivity

```html
<script lang="ts">
  let text = "";
</script>

<input type="text" bind:value="{text}" />
```

When you type the variable text gets updated, its a proper binding. This is the developer productivity with Svelte, unlike NextJS where we have to use `useState` and create a function to set the value.

## Excellent Typescript Support

With less effort at understanding typescritp you get better autocomplete and typescript out of the box with SvelteKit. Even in dynamic routes.

## Forms

Forms are much easier in Svelte. Just create a normal form with the old name attribute in input and you can get that in your backend with:

```ts
export const actions: Actions = {
  login: async ({ cookies, request }) => {
    const data = await request.formData();
    const email = data.get('email');
    const password = data.get('password');
	...
}
```

> You can use `use:enhance` to use JS to submit the page, by default it will reload the page

## Works Without Javascript

Now this is a feature which I was very interested in, staying close to the old web standards.
