<?php
/**
 * Plugin Name:       MarcTV 3D Model Embed Block
 * Description:       Embed GLB and glTF models in the block editor with a simple Gutenberg block.
 * Version:           1.0.0
 * Requires at least: 6.5
 * Requires PHP:      7.4
 * Author:            Marc Toensing
 * Author URI:        https://marc.tv
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       marctv-3d-model-embed-block
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

define( 'MARCTV_3D_MODEL_EMBED_BLOCK_VERSION', '1.0.0' );
define( 'MARCTV_3D_MODEL_EMBED_BLOCK_ELEMENT_VERSION', '4.2.0' );
define(
	'MARCTV_3D_MODEL_EMBED_BLOCK_ELEMENT_PATH',
	'public/vendor/model-viewer/4.2.0/model-viewer-umd.min.js'
);

/**
 * Registers the web component and block metadata.
 */
function marctv_3d_model_embed_block_init() {
	// Bundled vendor asset:
	// @google/model-viewer@4.2.0
	// dist/model-viewer-umd.min.js
	wp_register_script(
		'marctv-3d-model-embed-block-element',
		plugins_url( MARCTV_3D_MODEL_EMBED_BLOCK_ELEMENT_PATH, __FILE__ ),
		array(),
		MARCTV_3D_MODEL_EMBED_BLOCK_ELEMENT_VERSION,
		array(
			'in_footer' => true,
			'strategy'  => 'defer',
		)
	);

	if ( file_exists( __DIR__ . '/build/block.json' ) ) {
		register_block_type( __DIR__ . '/build' );
	}
}
add_action( 'init', 'marctv_3d_model_embed_block_init' );

/**
 * Loads the web component inside the editor so server-side previews are interactive there too.
 */
function marctv_3d_model_embed_block_enqueue_editor_module() {
	wp_enqueue_script( 'marctv-3d-model-embed-block-element' );
}
add_action( 'enqueue_block_editor_assets', 'marctv_3d_model_embed_block_enqueue_editor_module' );

/**
 * Allows GLB and glTF uploads in the media library.
 *
 * @param array<string, string> $mimes Allowed mime types.
 * @return array<string, string>
 */
function marctv_3d_model_embed_block_upload_mimes( $mimes ) {
	$mimes['glb']  = 'model/gltf-binary';
	$mimes['gltf'] = 'model/gltf+json';

	return $mimes;
}
add_filter( 'upload_mimes', 'marctv_3d_model_embed_block_upload_mimes' );

/**
 * Keeps WordPress from second-guessing GLB and glTF uploads when fileinfo is generic.
 *
 * @param array<string, mixed> $data     File data array.
 * @param string               $file     Full path to the file.
 * @param string               $filename Uploaded filename.
 * @return array<string, mixed>
 */
function marctv_3d_model_embed_block_check_filetype_and_ext( $data, $file, $filename ) {
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
add_filter( 'wp_check_filetype_and_ext', 'marctv_3d_model_embed_block_check_filetype_and_ext', 10, 3 );
