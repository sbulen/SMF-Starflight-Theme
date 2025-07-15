// Animation variables...
var ta_canvas = null;
var ta_context = null;
var ta_resize_observer = null;
var starsArray = [];

// SMF main jquery one-time ready function...
$(function() {
	$('ul.dropmenu, ul.quickbuttons').superfish({delay : 250, speed: 100, sensitivity : 8, interval : 50, timeout : 1});

	// tooltips
	$('.preview').SMFtooltip();

	// find all nested linked images and turn off the border
	$('a.bbc_link img.bbc_img').parent().css('border', '0');

	// Animation setup...
	ta_canvas = document.getElementById("canvas-body");
	ta_canvas.width = outerWidth;
	ta_canvas.height = outerHeight;
	ta_context = ta_canvas.getContext("2d");
	ta_context.globalAlpha = 1;
	ta_context.fillStyle = "#000";
	ta_context.fillRect(0, 0, ta_canvas.width, ta_canvas.height);var ta_resize_observer = null;
	generateStars(991);

	// If user has opted out of animations, then don't do 'em...
	if (typeof bsc_disable_anim === "undefined")
		anim();

	// Allow coloring of checkbox & radio button backgrounds...
	// This label after all checkboxes guarantees that *ALL* checkboxes 
	// are findable and changeable by .css, and selectable as well.
	// If no ID, gotta create one.
	// Don't want to make hidden elements appear; check for visibility.
	$("input:checkbox, input:radio").each(function() {
		let $id = this.id;
		let $class = "";
		if ((this.style.display !== "none") && (this.parentElement.style.display !== "none")) {
			if ($id == "") {
				$id = "crid_" + Math.random().toString().substring(2, 15) + "_" + Math.random().toString().substring(2, 15);
				this.id = $id;
			}
			// Use same class as checkbox/radio button, so display values assigned by css affect both
			if (this.className != "") {
				$class = " class='" + this.className + "'";
			}
			$("<label for='" + $id + "'" + $class + "></label>").insertAfter(this);
		}
	});

	// Add a listener for the color pickers, for real-time display...
	$('[id^=cc_]').on('input', function(e) {
		let input_type = e.target.type;
		let color_var = "--" + e.target.id;
		let new_color = e.target.value;
		// Document level = :root...
		if ((input_type === 'color') && (typeof new_color !== undefined))
			document.documentElement.style.setProperty(color_var, new_color);
	});

	// SMF dynamically alters height frequently, so the true doc height isn't always visible to js.
	// This deals with *all* dynamic doc size changes efficiently, including many missed by resize events.
	// And no reload() calls are necessary, so it's fast...  Required for animation.
	ta_resize_observer = new ResizeObserver(entries => {
		for (let entry of entries) {
			ta_canvas.style.width = entry.contentRect.width + "px";
			ta_canvas.style.height = entry.contentRect.width*outerHeight/outerWidth + "px";
		}
	});
	ta_resize_observer.observe(document.body)
});

// Propagate css variables & values into the sceditor iframe document when they hit the wysiwyg button.
// This enables you to manipulate sceditor colors on Current Theme screen.
$(window).on("load", function() {
	$("div.roundframe").on("click", function(e) {
		// User clicked on wysiwyg div...
		if (e.target.parentElement.className !== "sceditor-button sceditor-button-source")
			return;
		let $style = getComputedStyle(document.documentElement);
		let $vars = bsc_css_vars;
		let $frame = $("iframe").contents();
		$vars.forEach(($var) => {
			$frame.find(":root").css($var, $style.getPropertyValue($var));
		});
	});
});

// Propagate css variables into svg images, so the svg palette is kept in sync with the theme.
// For this to work, svg must be loaded via object elements, and the svg itself must use the same 
// variable names in its own internal style sheet.
$(window).on("load", function() {
	$("object[type='image/svg+xml']").each(function() {
		// Get this doc's vars from root...
		let $style = getComputedStyle(document.documentElement);
		let $vars = bsc_css_vars;
		let $svg_doc = this.contentDocument;
		// If no doc to update, move on...
		if ($svg_doc === null)
			return;
		$vars.forEach(($var) => {
			$svg_doc.documentElement.style.setProperty($var, $style.getPropertyValue($var));
		});
		// Substitute forum name where asked...
		$(".smf_mbname_text", $svg_doc).each(function() {
			this.textContent = smf_mbname_text;
		});
	});
});

// Toggles the element height and width styles of an image.
function smc_toggleImageDimensions()
{
	$('.postarea .bbc_img.resized').each(function(index, item)
	{
		$(item).click(function(e)
		{
			$(item).toggleClass('original_size');
		});
	});
}

// Add a load event for the function above.
addLoadEvent(smc_toggleImageDimensions);

function smf_addButton(stripId, image, options)
{
	$('#' + stripId).append(
		'<a href="' + options.sUrl + '" class="button last" ' + ('sCustom' in options ? options.sCustom : '') + ' ' + ('sId' in options ? ' id="' + options.sId + '_text"' : '') + '>'
			+ options.sText +
		'</a>'
	);
}

// Animation functions...
// Animation functions...
// Animation functions...

function generateColor() {
  let hexSet = "0123456789ABCDEF";
  let finalHexString = "#";
  for (let i = 0; i < 6; i++) {
    finalHexString += hexSet[Math.ceil(Math.random() * 3 + 12)];
  }
  return finalHexString;
}

function generateStars(amount)
{
	let long_dim = Math.max(ta_canvas.height, ta_canvas.width);
	for (let i = 0; i < amount; i++)
	{
		starsArray[i] = new Star(
			this.angle = Math.random() * Math.PI * 2,
			this.dist = Math.random() * long_dim / 2,
			this.size = Math.ceil(1 - (this.dist / long_dim)) + 0.2,
			this.color = generateColor(),
			this.speed = Math.random() * Math.ceil(this.dist * 0.02 * (1 - (this.dist / long_dim)))
		);
	}
}

function Star(angle, dist, size, color, speed)
{
	this.angle = angle;
	this.dist = dist;
	this.size = size;
	this.color = color;
	this.speed = speed;

	this.fly = function ()
	{
		// Scoot it along...
		this.dist = this.dist + this.speed;

		let x = (Math.sin(this.angle) * this.dist) + (ta_canvas.width / 2);
		let y = (Math.cos(this.angle) * this.dist) + (ta_canvas.height / 2);

		ta_context.beginPath();
		ta_context.fillStyle = this.color;
		ta_context.arc(x, y, this.size, 0, Math.PI*2);
		ta_context.fill();

		// Too far out, make another...
		let long_dim = Math.max(ta_canvas.height, ta_canvas.width);
		if (this.dist > long_dim * .75)
		{
			this.angle = Math.random() * Math.PI * 2;
			this.dist = Math.random() * long_dim / 2;
			this.size = Math.ceil(1 - (this.dist / long_dim)) + 0.2;
			this.color = generateColor();
			this.speed = Math.random() * Math.ceil(this.dist * 0.02 * (1 - (this.dist / long_dim)));
		}
	};
}

function anim()
{
	// If ta_context is null, theme is changing due to logon/logoff, etc.
	// Just exit gracefully...
	if (ta_context === null)
		return;

	requestAnimationFrame(anim);

	ta_context.globalAlpha = 1;
	ta_context.fillStyle = "#000";
	ta_context.fillRect(0, 0, ta_canvas.width, ta_canvas.height);

	starsArray.forEach((star) => star.fly());
}
