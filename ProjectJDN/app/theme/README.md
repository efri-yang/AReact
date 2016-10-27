# `css`

All `.css` files in one of the five subfolders get compiled into one big file. You can write in existing files and add new ones and they'll get imported automatically.

## Folder structure

The boilerplate comes with a basic folder structure to keep the CSS files organised. This is what the folders are for:

* `base`: Global styling, e.g. setting the box–model for all elements

* ~~`components`: Component specific styling, e.g. buttons, modals,...~~

* ~~`layout`: Global layouts, e.g. article, homepage,...~~

* `utils`: Utility files, e.g. variables, mixins, functions,...

* ~~`vendor`: External files, e.g. a CSS reset~~

* `index.css`: All CSS files from the above directories are `@import`ed into this file and inlined with `postcss-import`.
