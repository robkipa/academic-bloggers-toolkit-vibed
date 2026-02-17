<?php
/**
 * Editor functionality.
 *
 * @package ABT
 */

declare(strict_types=1);

namespace ABT\Editor;

defined( 'ABSPATH' ) || exit;

use function ABT\Utils\add_json_script;

/**
 * Enqueue admin scripts.
 */
function enqueue_scripts() {
	global $post;
	wp_enqueue_style( 'abt-editor' );
	wp_enqueue_script( 'abt-editor' );

	$state = init_editor_state( $post->ID );
	add_json_script( 'abt-editor-state', $state );
}
add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\enqueue_scripts' );

/**
 * Register block styles for the iframe editor (avoids "added to the iframe incorrectly" warning).
 * Must run after blocks are registered; enqueue_block_editor_assets is appropriate.
 */
function enqueue_block_styles_for_editor() {
	$blocks = [ 'abt/bibliography', 'abt/footnotes', 'abt/static-bibliography' ];
	foreach ( $blocks as $block_name ) {
		wp_enqueue_block_style( $block_name, [ 'handle' => 'abt-editor-blocks' ] );
	}
}
add_action( 'enqueue_block_editor_assets', __NAMESPACE__ . '\enqueue_block_styles_for_editor', 20 );

/**
 * Register post meta to store editor state.
 */
function register_metadata() {
	register_meta(
		'post',
		'_abt_state',
		[
			'show_in_rest'  => true,
			'single'        => true,
			'type'          => 'string',
			'auth_callback' => function() {
				return current_user_can( 'edit_posts' );
			},
		]
	);
}
add_action( 'init', __NAMESPACE__ . '\register_metadata' );

/**
 * Default citation style when options are not set.
 *
 * @return array{kind: string, label: string, value: string}
 */
function get_default_citation_style(): array {
	return [
		'kind'  => 'predefined',
		'label' => 'American Medical Association',
		'value' => 'american-medical-association',
	];
}

/**
 * Prepares editor state and returns the value.
 *
 * If editor state doesn't exist, this function initializes a new blank state
 * and converts any existing old legacy editor state to the current format.
 *
 * If state exists, decode it from json and return the value.
 *
 * @param int $post_id The post id.
 * @return object The editor state (references, style).
 */
function init_editor_state( int $post_id ) {
	$meta  = get_post_meta( $post_id );
	$opts  = get_option( ABT_OPTIONS_KEY, [] );
	$style = $opts['citation_style'] ?? get_default_citation_style();

	if ( ! array_key_exists( '_abt_state', $meta ) || ! has_blocks( $post_id ) ) {
		$state = (object) [
			'references' => [],
			'style'      => $style,
		];

		if ( array_key_exists( '_abt-reflist-state', $meta ) ) {
			$legacy_meta = json_decode( $meta['_abt-reflist-state'][0] );
			if ( $legacy_meta && isset( $legacy_meta->CSL ) ) {
				foreach ( $legacy_meta->CSL as $id => $data ) { // phpcs:ignore
					$state->references[] = $data;
				}
				if ( isset( $legacy_meta->cache->style ) ) {
					$state->style = $legacy_meta->cache->style;
				}
			}
		}

		add_post_meta(
			$post_id,
			'_abt_state',
			wp_slash( wp_json_encode( $state ) ),
			true
		);
	} else {
		$state = json_decode( $meta['_abt_state'][0] );
		if ( ! is_object( $state ) ) {
			$state = (object) [
				'references' => [],
				'style'      => $style,
			];
		}
	}

	return $state;
}
