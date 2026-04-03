=== Minimal Model Viewer Block ===
Contributors: mtoensing
Tags: 3d, glb, gltf, model-viewer, gutenberg
Requires at least: 6.5
Tested up to: 6.9
Requires PHP: 7.4
Stable tag: 0.3.6
License: GPLv2 or later
License URI: https://www.gnu.org/licenses/gpl-2.0.html

Show interactive 3D models in WordPress with a simple block for GLB and glTF files.

== Description ==

Adds a block for interactive 3D models in `.glb` and `.gltf` format from the media library.

Includes the `model-viewer` runtime locally:

* Project: https://modelviewer.dev/
* Source: https://github.com/google/model-viewer
* Package: `@google/model-viewer`
* Version: `4.2.0`
* Bundled file: `public/vendor/model-viewer/4.2.0/model-viewer-umd.min.js`
* License: Apache License 2.0

The bundled file is kept versioned in the plugin and documented alongside the asset.

== Installation ==

1. Install and activate the plugin.
2. Upload a `.glb` or `.gltf` file to the media library.
3. Insert the `3D Model Viewer` block and select the file.

== Frequently Asked Questions ==

= Which file formats are supported? =

The block supports 3D models in `.glb` and `.gltf`.

= Can I enter an external model URL? =

No. Models are selected from the WordPress media library.

== Changelog ==

= 0.3.6 =
* Move the bundled `model-viewer` runtime to a versioned vendor path and document its provenance more clearly.

= 0.3.5 =
* Show model load errors in the editor preview only and keep the frontend neutral.

= 0.3.4 =
* Add a clear block-level error message when a model cannot be loaded.
* Keep the same feedback visible in the editor preview.

= 0.3.3 =
* Change editor UI strings to English source strings for localization.

= 0.3.2 =
* Move the accepted format hint into the block sidebar.
* Keep editor selection simple and limit frontend interaction to the fixed horizontal axis.

= 0.3.1 =
* Save explicit `camera-controls` and `auto-rotate` attributes so the frontend stays interactive after WordPress sanitization.
* Let the block fill its available width more reliably inside groups and aligned layouts in the editor.

= 0.3.0 =
* Save native block markup instead of relying on editor-side server rendering.
* Remove the server-side render architecture and keep the block static.

= 0.2.0 =
* Move block source to the standard `src` and `build` structure.
* Add npm build tooling and GitHub Actions similar to the project standard.
