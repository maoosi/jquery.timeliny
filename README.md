#Timeliny
-----------
Timeliny is a responsive jQuery plugin for creating year-based interactive timelines.
What you are looking for is in the `/dist/` folder.

#### Dependencies
It expects jQuery 2.x to work: https://github.com/jquery/jquery

#### Compatibility
Recent browsers such as :
IE 10+, Opera, Safari, Firefox & Chrome.

##Installation
-----------
// TODO

##Basic Usage
-----------
```html
<div id="example1">
	<div data-year="2014" class="active">Short text here</div>
	<div data-year="2011">Short text here</div>
	<div data-year="2010">Short text here</div>
</div>
```

```js
$('#example1').timeliny();
```

##Documentation
-----------

### Options

// TODO

### Callback Events

// TODO

### Public Methods

// TODO

### Sass Settings

If you want to use Sass, simply import the file from `jquery.timeliny.scss` in your project.

You can configure the plugin by editing the settings at the top of the file.

```css
/**
 * Settings
**/

$timeliny_classname: 'timeliny';

$timeliny_base-color: #ddd;
$timeliny_active-color: #37404A;
$timeliny_text-color: #000;

$timeliny_dots-radius: 0.6rem;
$timeliny_global-width: 100%;
$timeliny_global-margin: 0 auto 4rem;
$timeliny_max-inner-width: 1024px;
$timeliny_font: normal normal 400 1rem/1 'Montserrat', Arial, sans-serif;
$timeliny_spacings: 5rem;
$timeliny_transition-time: 0.35s;
$timeliny_vertical-line-pos: 32%;
$timeliny_small-breakdown: 768px;
```


##Contributing
-----------
Feel free to contribute by forking then making a pull request.
Edit files in the `/src/` folder,  run `gulp` to copy/minify into the `/dist/` folder and to watch for changes.
