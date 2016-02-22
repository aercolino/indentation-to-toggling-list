# Indentation to Toggling List
Convert an indented text to a toggling HTML list.

## Usage
- A root folder is not required.
- Indent children by two spaces.
- Add a trailing slash to empty folders.
- Optionally add a trailing slash to non empty folders.
- Wrap your indented text into a PRE element.
- Wrap the PRE into a DIV (or other element) with a class `IndentationToTogglingList`.
- Optionally add a `data-expand` attribute with a JSON array of paths to expand by default.
- Without a `data-expand` attribute all paths will be open by default.
- When rendered, click on any bold folder for toggling its contents.

## Example

### Setup

Add this to the HEAD element of your HTML page:
```html
<link rel="stylesheet" type="text/css" href="indentation-to-toggling-list.css" />
<script type='text/javascript' src='indentation-to-toggling-list.js'></script>
```

Add something like this to the BODY element of your HTML page:
```html
<div class="IndentationToTogglingList" data-expand='["client/apps/", "client/shared/"]'>
<pre>
client/
  apps/
    auth/
      components/
        login/
          login.html
          login.js
        register/
          register.html
          register.js
      index/
        index.css
      index.html
      shared/
        config.js
        modules/
        services/
      start.js
    core/
  bower_components/
  docs/
  shared/
    config.js
    modules/
    services/
      authentication.service.js
      base64.service.js
      flash.service.js
      storage.service.js
    my-project.js
    routes.js
</pre>
</div>
```

### Result
Better seen with JSFiddle: https://jsfiddle.net/aercolino/u2u1vnhb/
