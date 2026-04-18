import { __ } from '@wordpress/i18n';

const STATUS_CLASS = 'wp-block-model-embed-3d-block__status';
const ERROR_CLASS = 'wp-block-model-embed-3d-block--has-error';

function getContainer( modelViewer ) {
	return (
		modelViewer?.closest( '.wp-block-model-embed-3d-block' ) ||
		modelViewer?.parentElement ||
		null
	);
}

function getErrorMessage( modelViewer ) {
	const src = ( modelViewer?.getAttribute( 'src' ) || '' ).toLowerCase();

	if ( src.endsWith( '.gltf' ) ) {
		return __(
			'This 3D model could not be loaded. glTF files need all referenced .bin and texture files, or a self-contained .glb instead.',
			'3d-model-embed-block'
		);
	}

	return __(
		'This 3D model could not be loaded. Please check the file and try again.',
		'3d-model-embed-block'
	);
}

function getStatusElement( container ) {
	let statusElement = container.querySelector( `.${ STATUS_CLASS }` );

	if ( statusElement ) {
		return statusElement;
	}

	statusElement = document.createElement( 'div' );
	statusElement.className = STATUS_CLASS;
	statusElement.hidden = true;
	statusElement.setAttribute( 'role', 'alert' );
	statusElement.setAttribute( 'aria-live', 'polite' );
	container.appendChild( statusElement );

	return statusElement;
}

export function clearModelViewerFeedback( modelViewer ) {
	const container = getContainer( modelViewer );

	if ( ! container ) {
		return;
	}

	const statusElement = getStatusElement( container );

	container.classList.remove( ERROR_CLASS );
	statusElement.hidden = true;
	statusElement.textContent = '';
}

export function showModelViewerError( modelViewer ) {
	const container = getContainer( modelViewer );

	if ( ! container ) {
		return;
	}

	const statusElement = getStatusElement( container );

	container.classList.add( ERROR_CLASS );
	statusElement.hidden = false;
	statusElement.textContent = getErrorMessage( modelViewer );
}

export function attachModelViewerFeedback( modelViewer ) {
	if ( ! modelViewer ) {
		return () => {};
	}

	const handleLoad = () => {
		clearModelViewerFeedback( modelViewer );
	};

	const handleError = () => {
		showModelViewerError( modelViewer );
	};

	const observer = new window.MutationObserver( ( mutations ) => {
		mutations.forEach( ( mutation ) => {
			if ( mutation.attributeName === 'src' ) {
				clearModelViewerFeedback( modelViewer );
			}
		} );
	} );

	modelViewer.addEventListener( 'load', handleLoad );
	modelViewer.addEventListener( 'error', handleError );
	observer.observe( modelViewer, {
		attributes: true,
		attributeFilter: [ 'src' ],
	} );

	return () => {
		modelViewer.removeEventListener( 'load', handleLoad );
		modelViewer.removeEventListener( 'error', handleError );
		observer.disconnect();
	};
}
