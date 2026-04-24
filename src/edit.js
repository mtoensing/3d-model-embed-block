import { __ } from '@wordpress/i18n';
import {
	BlockControls,
	InspectorControls,
	MediaPlaceholder,
	MediaReplaceFlow,
	MediaUpload,
	MediaUploadCheck,
	useBlockProps,
} from '@wordpress/block-editor';
import {
	BaseControl,
	Button,
	ColorPicker,
	PanelBody,
	RangeControl,
	TextControl,
	ToggleControl,
} from '@wordpress/components';
import { dispatch } from '@wordpress/data';
import { useEffect, useRef } from '@wordpress/element';
import { syncModelViewerElement } from './model-viewer';
import { attachModelViewerFeedback } from './viewer-feedback';

const ALLOWED_MODEL_TYPES = [ 'model/gltf-binary', 'model/gltf+json' ];
const ALLOWED_MODEL_FILE_INPUT = '.glb,.gltf,model/gltf-binary,model/gltf+json';

function getFileExtension( value ) {
	if ( ! value ) {
		return '';
	}

	const withoutQuery = String( value ).split( '?' )[ 0 ];
	const parts = withoutQuery.split( '.' );

	return parts.length > 1 ? parts.pop().toLowerCase() : '';
}

function isAllowedModelFile( media ) {
	const extension = getFileExtension(
		media?.filename || media?.url || media?.title?.rendered || media?.title
	);

	return extension === 'glb' || extension === 'gltf';
}

function showModelError() {
	const message = __(
		'Please select only files with the .glb or .gltf extension.',
		'marctv-3d-model-embed-block'
	);

	dispatch( 'core/notices' ).createErrorNotice( message, {
		type: 'snackbar',
	} );
}

function showModelUrlError() {
	const message = __(
		'Please enter a URL ending with .glb or .gltf.',
		'marctv-3d-model-embed-block'
	);

	dispatch( 'core/notices' ).createErrorNotice( message, {
		type: 'snackbar',
	} );
}

function renderButton( label, onClick, variant = 'primary' ) {
	return (
		<Button variant={ variant } onClick={ onClick }>
			{ label }
		</Button>
	);
}

function getModelAttributes( media ) {
	if ( ! isAllowedModelFile( media ) ) {
		showModelError();
		return null;
	}

	return {
		modelId: media.id,
		modelUrl: media.url || '',
	};
}

function getModelUrlAttributes( url ) {
	if ( ! url || ! isAllowedModelFile( { url } ) ) {
		showModelUrlError();
		return null;
	}

	return {
		modelId: 0,
		modelUrl: url,
	};
}

function EditorModelViewerPreview( { attributes } ) {
	const modelViewerRef = useRef( null );

	useEffect( () => {
		return attachModelViewerFeedback( modelViewerRef.current );
	}, [] );

	useEffect( () => {
		syncModelViewerElement( modelViewerRef.current, attributes );
	}, [ attributes ] );

	return (
		<model-viewer
			ref={ modelViewerRef }
			data-editor-preview="true"
			class="wp-block-model-embed-3d-block__viewer"
		>
			<div slot="progress-bar" aria-hidden="true" />
		</model-viewer>
	);
}

export default function Edit( { attributes, clientId, setAttributes } ) {
	const blockProps = useBlockProps();
	const hasModel = !! attributes.modelUrl;
	const hasCameraControls = attributes.cameraControls !== false;
	const hasZoomEnabled = attributes.zoomEnabled === true;
	const hasAutoRotate = attributes.autoRotate !== false;
	const backgroundColorControlId = `3d-model-embed-block-background-color-${ clientId }`;
	const onSelectModel = ( media ) => {
		const nextAttributes = getModelAttributes( media );

		if ( ! nextAttributes ) {
			return;
		}

		setAttributes( nextAttributes );
	};
	const onResetModel = () => {
		setAttributes( {
			modelId: 0,
			modelUrl: '',
		} );
	};
	const onSelectModelURL = ( url ) => {
		const nextAttributes = getModelUrlAttributes( url );

		if ( ! nextAttributes ) {
			return;
		}

		setAttributes( nextAttributes );
	};

	return (
		<>
			{ hasModel && (
				<BlockControls group="other">
					<MediaReplaceFlow
						mediaId={ attributes.modelId }
						mediaURL={ attributes.modelUrl }
						allowedTypes={ ALLOWED_MODEL_TYPES }
						accept={ ALLOWED_MODEL_FILE_INPUT }
						name={ __( 'Replace model', 'marctv-3d-model-embed-block' ) }
						onSelect={ onSelectModel }
						onSelectURL={ onSelectModelURL }
						onReset={ onResetModel }
					/>
				</BlockControls>
			) }

			<InspectorControls>
				<PanelBody
					title={ __( '3D Model', 'marctv-3d-model-embed-block' ) }
					initialOpen
				>
					<TextControl
						label={ __( 'Alt text', 'marctv-3d-model-embed-block' ) }
						value={ attributes.alt || '' }
						onChange={ ( value ) =>
							setAttributes( { alt: value } )
						}
						help={ __(
							'Leave empty if the model is purely decorative.',
							'marctv-3d-model-embed-block'
						) }
					/>

					<MediaUploadCheck>
						<MediaUpload
							allowedTypes={ [ 'image' ] }
							value={ attributes.posterId }
							onSelect={ ( media ) =>
								setAttributes( {
									posterId: media.id,
									posterUrl: media.url || '',
								} )
							}
							render={ ( { open } ) =>
								renderButton(
									attributes.posterUrl
										? __(
												'Replace poster',
												'marctv-3d-model-embed-block'
										  )
										: __(
												'Select poster',
												'marctv-3d-model-embed-block'
										  ),
									open,
									'secondary'
								)
							}
						/>
					</MediaUploadCheck>

					{ attributes.posterUrl && (
						<Button
							variant="tertiary"
							onClick={ () =>
								setAttributes( { posterId: 0, posterUrl: '' } )
							}
						>
							{ __( 'Remove poster', 'marctv-3d-model-embed-block' ) }
						</Button>
					) }
				</PanelBody>

				<PanelBody
					title={ __( 'Display', 'marctv-3d-model-embed-block' ) }
					initialOpen
				>
					<RangeControl
						label={ __(
							'Height in pixels',
							'marctv-3d-model-embed-block'
						) }
						value={ attributes.height ?? 520 }
						min={ 260 }
						max={ 1200 }
						step={ 10 }
						onChange={ ( value ) =>
							setAttributes( { height: value || 520 } )
						}
					/>

					<RangeControl
						label={ __( 'Framing', 'marctv-3d-model-embed-block' ) }
						value={ attributes.cameraDistance ?? 105 }
						min={ 60 }
						max={ 140 }
						step={ 1 }
						onChange={ ( value ) =>
							setAttributes( {
								cameraDistance: value ?? 105,
							} )
						}
						help={ __(
							'Lower values bring the camera closer. Uses model-viewer camera-orbit radius.',
							'marctv-3d-model-embed-block'
						) }
					/>

					<ToggleControl
						label={ __(
							'Interactive mode',
							'marctv-3d-model-embed-block'
						) }
						checked={ hasCameraControls }
						onChange={ ( value ) =>
							setAttributes( { cameraControls: value } )
						}
						help={ __(
							'Allows horizontal rotation with mouse or touch. Zoom can be enabled separately below; pan and axis changes stay disabled.',
							'marctv-3d-model-embed-block'
						) }
					/>

					<ToggleControl
						label={ __(
							'Zoom interaction',
							'marctv-3d-model-embed-block'
						) }
						checked={ hasZoomEnabled }
						onChange={ ( value ) =>
							setAttributes( { zoomEnabled: value } )
						}
						help={ __(
							'Enables pinch zoom on touch devices and mouse-wheel zoom on desktop. model-viewer exposes both together.',
							'marctv-3d-model-embed-block'
						) }
						disabled={ ! hasCameraControls }
					/>

					<ToggleControl
						label={ __( 'Auto rotate', 'marctv-3d-model-embed-block' ) }
						checked={ hasAutoRotate }
						onChange={ ( value ) =>
							setAttributes( { autoRotate: value } )
						}
						help={ __(
							'Off = manual horizontal rotation only.',
							'marctv-3d-model-embed-block'
						) }
					/>

					<RangeControl
						label={ __( 'Rotation speed', 'marctv-3d-model-embed-block' ) }
						value={ attributes.rotationPerSecond ?? 30 }
						min={ 1 }
						max={ 120 }
						step={ 1 }
						onChange={ ( value ) =>
							setAttributes( { rotationPerSecond: value || 30 } )
						}
						help={ __(
							'Degrees per second for auto-rotation.',
							'marctv-3d-model-embed-block'
						) }
						disabled={ ! hasAutoRotate }
					/>

					<RangeControl
						label={ __( 'Start angle', 'marctv-3d-model-embed-block' ) }
						value={ attributes.startAngle ?? 0 }
						min={ -180 }
						max={ 180 }
						step={ 5 }
						onChange={ ( value ) =>
							setAttributes( { startAngle: value || 0 } )
						}
						help={ __(
							'Rotates the model around the vertical axis on load.',
							'marctv-3d-model-embed-block'
						) }
					/>

					<ToggleControl
						label={ __(
							'Transparent background',
							'marctv-3d-model-embed-block'
						) }
						checked={ attributes.transparentBackground !== false }
						onChange={ ( value ) =>
							setAttributes( { transparentBackground: value } )
						}
					/>

					{ attributes.transparentBackground === false && (
						<BaseControl
							id={ backgroundColorControlId }
							label={ __(
								'Background color',
								'marctv-3d-model-embed-block'
							) }
							help={ __(
								'Used only when transparent background is disabled.',
								'marctv-3d-model-embed-block'
							) }
						>
							<ColorPicker
								color={
									attributes.backgroundColor || '#f3efe4'
								}
								enableAlpha={ false }
								onChange={ ( value ) =>
									setAttributes( {
										backgroundColor: value || '#f3efe4',
									} )
								}
							/>
						</BaseControl>
					) }
				</PanelBody>
			</InspectorControls>

			{ hasModel ? (
				<figure { ...blockProps }>
					<EditorModelViewerPreview attributes={ attributes } />
				</figure>
			) : (
				<div { ...blockProps }>
					<MediaPlaceholder
						accept={ ALLOWED_MODEL_FILE_INPUT }
						allowedTypes={ ALLOWED_MODEL_TYPES }
						disableMediaButtons={ false }
						labels={ {
							title: __( '3D model', 'marctv-3d-model-embed-block' ),
							instructions: __(
								'Upload a .glb or .gltf file, choose one from the Media Library, or insert one from a URL.',
								'marctv-3d-model-embed-block'
							),
						} }
						multiple={ false }
						onSelect={ onSelectModel }
						onSelectURL={ onSelectModelURL }
						value={ attributes.modelId }
					/>
				</div>
			) }
		</>
	);
}
