const MIN_HEIGHT = 260;
const MAX_HEIGHT = 1200;
const DEFAULT_HEIGHT = 520;
const MIN_CAMERA_DISTANCE = 60;
const MAX_CAMERA_DISTANCE = 140;
const DEFAULT_CAMERA_DISTANCE = 105;
const MIN_ROTATION = 1;
const MAX_ROTATION = 120;
const DEFAULT_ROTATION = 30;
const MIN_START_ANGLE = -180;
const MAX_START_ANGLE = 180;
const DEFAULT_BACKGROUND = '#f3efe4';
const DEFAULT_CAMERA_CONTROLS = true;
const DEFAULT_AUTO_ROTATE = true;
const FIXED_POLAR_ANGLE = '75deg';
const HIDDEN_PROGRESS_BAR_SLOT =
	'<div slot="progress-bar" aria-hidden="true"></div>';

function clamp( value, min, max ) {
	return Math.min( max, Math.max( min, value ) );
}

function escapeAttribute( value ) {
	return String( value )
		.replaceAll( '&', '&amp;' )
		.replaceAll( '"', '&quot;' )
		.replaceAll( '<', '&lt;' )
		.replaceAll( '>', '&gt;' );
}

export function getModelViewerAttributes( attributes ) {
	const height = clamp(
		attributes.height ?? DEFAULT_HEIGHT,
		MIN_HEIGHT,
		MAX_HEIGHT
	);
	const cameraDistance = clamp(
		attributes.cameraDistance ?? DEFAULT_CAMERA_DISTANCE,
		MIN_CAMERA_DISTANCE,
		MAX_CAMERA_DISTANCE
	);
	const rotationPerSecond = clamp(
		attributes.rotationPerSecond ?? DEFAULT_ROTATION,
		MIN_ROTATION,
		MAX_ROTATION
	);
	const startAngle = clamp(
		attributes.startAngle ?? 0,
		MIN_START_ANGLE,
		MAX_START_ANGLE
	);
	const transparentBackground = attributes.transparentBackground !== false;
	const backgroundColor = attributes.backgroundColor || DEFAULT_BACKGROUND;
	const cameraControls =
		attributes.cameraControls !== false && DEFAULT_CAMERA_CONTROLS;
	const zoomEnabled = attributes.zoomEnabled === true;
	const autoRotate = attributes.autoRotate !== false && DEFAULT_AUTO_ROTATE;

	const props = {
		class: 'wp-block-model-embed-3d-block__viewer',
		src: attributes.modelUrl || undefined,
		loading: 'lazy',
		alt: attributes.alt || undefined,
		poster: attributes.posterUrl || undefined,
		style: `--model-embed-3d-height:${ height }px;--model-embed-3d-background:${
			transparentBackground ? 'transparent' : backgroundColor
		};`,
		'camera-orbit': `0deg ${ FIXED_POLAR_ANGLE } ${ cameraDistance }%`,
		'shadow-intensity': '1',
		'shadow-softness': '0.8',
		'interaction-prompt': 'auto',
	};

	if ( cameraControls ) {
		props[ 'camera-controls' ] = 'camera-controls';
		props[ 'touch-action' ] = 'pan-y';
		props[ 'disable-pan' ] = 'disable-pan';
		props[ 'disable-tap' ] = 'disable-tap';
		props[ 'min-camera-orbit' ] = `auto ${ FIXED_POLAR_ANGLE } auto`;
		props[ 'max-camera-orbit' ] = `auto ${ FIXED_POLAR_ANGLE } auto`;

		if ( ! zoomEnabled ) {
			props[ 'disable-zoom' ] = 'disable-zoom';
		}
	}

	if ( autoRotate ) {
		props[ 'auto-rotate' ] = 'auto-rotate';
		props[ 'auto-rotate-delay' ] = '0';
		props[ 'rotation-per-second' ] = `${ rotationPerSecond }deg`;
	}

	if ( startAngle !== 0 ) {
		props.orientation = `0deg ${ startAngle }deg 0deg`;
	}

	return props;
}

export function syncModelViewerElement( element, attributes ) {
	if ( ! element ) {
		return;
	}

	const attributesMap = getModelViewerAttributes( attributes );
	const nextEntries = Object.entries( attributesMap ).filter(
		( [ , value ] ) =>
			value !== undefined &&
			value !== false &&
			value !== null &&
			value !== ''
	);
	const nextAttributeNames = new Set( nextEntries.map( ( [ key ] ) => key ) );

	Array.from( element.getAttributeNames() ).forEach( ( name ) => {
		if ( name === 'data-editor-preview' ) {
			return;
		}

		if ( ! nextAttributeNames.has( name ) ) {
			element.removeAttribute( name );
		}
	} );

	nextEntries.forEach( ( [ key, value ] ) => {
		element.setAttribute( key, value === true ? key : String( value ) );
	} );
}

export function getModelViewerHtml( attributes ) {
	const attributesMap = getModelViewerAttributes( attributes );
	const parts = [];

	Object.entries( attributesMap ).forEach( ( [ key, value ] ) => {
		if (
			value === undefined ||
			value === false ||
			value === null ||
			value === ''
		) {
			return;
		}

		if ( value === true ) {
			parts.push( key );
			return;
		}

		parts.push( `${ key }="${ escapeAttribute( value ) }"` );
	} );

	return `<model-viewer ${ parts.join(
		' '
	) }>${ HIDDEN_PROGRESS_BAR_SLOT }</model-viewer>`;
}
