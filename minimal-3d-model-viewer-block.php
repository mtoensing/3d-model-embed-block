<?php
/**
 * Plugin Name:       Minimal 3D Model Viewer Block
 * Description:       Embed GLB and glTF models in the block editor with a minimal, close-to-core Gutenberg block.
 * Version:           0.4.0
 * Requires at least: 6.5
 * Requires PHP:      7.4
 * Author:            Marc Toensing
 * Author URI:        https://marc.tv
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       minimal-3d-model-viewer-block
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'MINIMAL_3D_MODEL_VIEWER_BLOCK_VERSION', '0.4.0' );
define( 'MINIMAL_3D_MODEL_VIEWER_ELEMENT_VERSION', '4.2.0' );
define(
	'MINIMAL_3D_MODEL_VIEWER_ELEMENT_PATH',
	'public/vendor/model-viewer/4.2.0/model-viewer-umd.min.js'
);

/**
 * Registers the web component and block metadata.
 */
function minimal_3d_model_viewer_block_init() {
	// Bundled vendor asset:
	// @google/model-viewer@4.2.0
	// dist/model-viewer-umd.min.js
	wp_register_script(
		'minimal-3d-model-viewer-element',
		plugins_url( MINIMAL_3D_MODEL_VIEWER_ELEMENT_PATH, __FILE__ ),
		array(),
		MINIMAL_3D_MODEL_VIEWER_ELEMENT_VERSION,
		array(
			'in_footer' => true,
			'strategy'  => 'defer',
		)
	);

	if ( file_exists( __DIR__ . '/build/block.json' ) ) {
		register_block_type( __DIR__ . '/build' );
	}
}
add_action( 'init', 'minimal_3d_model_viewer_block_init' );

/**
 * Loads the web component inside the editor so server-side previews are interactive there too.
 */
function minimal_3d_model_viewer_enqueue_editor_module() {
	wp_enqueue_script( 'minimal-3d-model-viewer-element' );
}
add_action( 'enqueue_block_editor_assets', 'minimal_3d_model_viewer_enqueue_editor_module' );

/**
 * Allows GLB and glTF uploads in the media library.
 *
 * @param array<string, string> $mimes Allowed mime types.
 * @return array<string, string>
 */
function minimal_3d_model_viewer_upload_mimes( $mimes ) {
	$mimes['glb']  = 'model/gltf-binary';
	$mimes['gltf'] = 'model/gltf+json';

	return $mimes;
}
add_filter( 'upload_mimes', 'minimal_3d_model_viewer_upload_mimes' );

/**
 * Keeps WordPress from second-guessing GLB and glTF uploads when fileinfo is generic.
 *
 * @param array<string, mixed> $data     File data array.
 * @param string               $file     Full path to the file.
 * @param string               $filename Uploaded filename.
 * @return array<string, mixed>
 */
function minimal_3d_model_viewer_check_filetype_and_ext( $data, $file, $filename ) {
	$extension = strtolower( pathinfo( $filename, PATHINFO_EXTENSION ) );

	if ( 'glb' === $extension && ( empty( $data['ext'] ) || empty( $data['type'] ) ) ) {
		$data['ext']             = 'glb';
		$data['type']            = 'model/gltf-binary';
		$data['proper_filename'] = $filename;
	}

	if ( 'gltf' === $extension && ( empty( $data['ext'] ) || empty( $data['type'] ) ) ) {
		$data['ext']             = 'gltf';
		$data['type']            = 'model/gltf+json';
		$data['proper_filename'] = $filename;
	}

	return $data;
}
add_filter( 'wp_check_filetype_and_ext', 'minimal_3d_model_viewer_check_filetype_and_ext', 10, 3 );
