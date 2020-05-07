/**
 * External dependencies
 */
import { View, Text, TouchableWithoutFeedback } from 'react-native';

/**
 * WordPress dependencies
 */
import { Component } from '@wordpress/element';
import { GlobalStylesContext } from '@wordpress/components';
import { withDispatch, withSelect } from '@wordpress/data';
import { compose, withPreferredColorScheme } from '@wordpress/compose';
import {
	getBlockType,
	__experimentalGetAccessibleBlockLabel as getAccessibleBlockLabel,
} from '@wordpress/blocks';

/**
 * Internal dependencies
 */
import styles from './block.scss';
import BlockEdit from '../block-edit';
import BlockInvalidWarning from './block-invalid-warning';
import BlockMobileToolbar from '../block-mobile-toolbar';

class BlockListBlock extends Component {
	constructor() {
		super( ...arguments );

		this.onFocus = this.onFocus.bind( this );
	}
	// wrapperProps are always a new reference and forces update even if value is the same
	shouldComponentUpdate( nextProps ) {
		if (
			nextProps.isValid !== this.props.isValid ||
			nextProps.isInnerBlockSelected !==
				this.props.isInnerBlockSelected ||
			nextProps.isParentSelected !== this.props.isParentSelected ||
			nextProps.firstToSelectId !== this.props.firstToSelectId ||
			nextProps.isTouchable !== this.props.isTouchable ||
			nextProps.isSelected !== this.props.isSelected ||
			nextProps.parentWidth !== this.props.parentWidth ||
			JSON.stringify( nextProps.wrapperProps ) !==
				JSON.stringify( this.props.wrapperProps ) ||
			JSON.stringify( nextProps.attributes ) !==
				JSON.stringify( this.props.attributes )
		) {
			return true;
		}

		return false;
	}

	onFocus() {
		const { firstToSelectId, isSelected, onSelect } = this.props;
		if ( ! isSelected ) {
			onSelect( firstToSelectId );
		}
	}

	getBlockForType() {
		return (
			<GlobalStylesContext.Consumer>
				{ ( globalStyle ) => {
					const mergedStyle = {
						...globalStyle,
						...this.props.wrapperProps.style,
					};
					return (
						<GlobalStylesContext.Provider value={ mergedStyle }>
							<BlockEdit
								name={ this.props.name }
								isSelected={ this.props.isSelected }
								attributes={ this.props.attributes }
								setAttributes={ this.props.onChange }
								onFocus={ this.onFocus }
								onReplace={ this.props.onReplace }
								mergeBlocks={ this.props.mergeBlocks }
								onCaretVerticalPositionChange={
									this.props.onCaretVerticalPositionChange
								}
								// Block level styles
								wrapperProps={ this.props.wrapperProps }
								// inherited styles merged with block level styles
								mergedStyle={ mergedStyle }
								clientId={ this.props.clientId }
								parentWidth={ this.props.parentWidth }
								contentStyle={ this.props.contentStyle }
								onDeleteBlock={ this.props.onDeleteBlock }
							/>
						</GlobalStylesContext.Provider>
					);
				} }
			</GlobalStylesContext.Consumer>
		);
	}

	renderBlockTitle() {
		return (
			<View style={ styles.blockTitle }>
				<Text>BlockType: { this.props.name }</Text>
			</View>
		);
	}

	render() {
		const {
			attributes,
			blockType,
			clientId,
			icon,
			isSelected,
			isValid,
			order,
			title,
			isDimmed,
			isTouchable,
			onDeleteBlock,
			isStackedHorizontally,
			isParentSelected,
			getStylesFromColorScheme,
			marginVertical,
			marginHorizontal,
			isInnerBlockSelected,
		} = this.props;

		const accessibilityLabel = getAccessibleBlockLabel(
			blockType,
			attributes,
			order + 1
		);

		const accessible = ! ( isSelected || isInnerBlockSelected );

		return (
			<TouchableWithoutFeedback
				onPress={ this.onFocus }
				accessible={ accessible }
				accessibilityRole={ 'button' }
			>
				<View
					style={ { flex: 1 } }
					accessibilityLabel={ accessibilityLabel }
				>
					<View
						pointerEvents={ isTouchable ? 'auto' : 'box-only' }
						accessibilityLabel={ accessibilityLabel }
						style={ [
							{ marginVertical, marginHorizontal, flex: 1 },
							isDimmed && styles.dimmed,
						] }
					>
						{ isSelected && (
							<View
								style={ [
									styles.solidBorder,
									getStylesFromColorScheme(
										styles.solidBorderColor,
										styles.solidBorderColorDark
									),
								] }
							/>
						) }
						{ isParentSelected && (
							<View
								style={ [
									styles.dashedBorder,
									getStylesFromColorScheme(
										styles.dashedBorderColor,
										styles.dashedBorderColorDark
									),
								] }
							/>
						) }
						{ isValid ? (
							this.getBlockForType()
						) : (
							<BlockInvalidWarning
								blockTitle={ title }
								icon={ icon }
							/>
						) }
						<View style={ styles.neutralToolbar }>
							{ isSelected && (
								<BlockMobileToolbar
									clientId={ clientId }
									onDelete={ onDeleteBlock }
									isStackedHorizontally={
										isStackedHorizontally
									}
								/>
							) }
						</View>
					</View>
				</View>
			</TouchableWithoutFeedback>
		);
	}
}

export default compose( [
	withSelect( ( select, { clientId, rootClientId } ) => {
		const {
			getBlockIndex,
			isBlockSelected,
			__unstableGetBlockWithoutInnerBlocks,
			getSelectedBlockClientId,
			getLowestCommonAncestorWithSelectedBlock,
			getBlockParents,
			hasSelectedInnerBlock,
		} = select( 'core/block-editor' );

		const order = getBlockIndex( clientId, rootClientId );
		const isSelected = isBlockSelected( clientId );
		const isInnerBlockSelected = hasSelectedInnerBlock( clientId );
		const block = __unstableGetBlockWithoutInnerBlocks( clientId );
		const { name, attributes, isValid } = block || {};

		const blockType = getBlockType( name || 'core/missing' );
		const title = blockType.title;
		const icon = blockType.icon;

		const parents = getBlockParents( clientId, true );
		const parentId = parents[ 0 ] || '';

		const selectedBlockClientId = getSelectedBlockClientId();

		const commonAncestor = getLowestCommonAncestorWithSelectedBlock(
			clientId
		);
		const commonAncestorIndex = parents.indexOf( commonAncestor ) - 1;
		const firstToSelectId = commonAncestor
			? parents[ commonAncestorIndex ]
			: parents[ parents.length - 1 ];

		const isParentSelected =
			// set false as a default value to prevent re-render when it's changed from null to false
			( selectedBlockClientId || false ) &&
			selectedBlockClientId === parentId;

		const selectedParents = selectedBlockClientId
			? getBlockParents( selectedBlockClientId )
			: [];
		const isDescendantOfParentSelected = selectedParents.includes(
			parentId
		);
		const isTouchable =
			isSelected ||
			isDescendantOfParentSelected ||
			isParentSelected ||
			parentId === '';
		return {
			icon,
			name: name || 'core/missing',
			order,
			title,
			attributes,
			blockType,
			isSelected,
			isInnerBlockSelected,
			isValid,
			isParentSelected,
			firstToSelectId,
			isTouchable,
			wrapperProps: blockType.getEditWrapperProps
				? blockType.getEditWrapperProps( attributes ) || {}
				: {},
		};
	} ),
	withDispatch( ( dispatch, ownProps, { select } ) => {
		const {
			insertBlocks,
			mergeBlocks,
			replaceBlocks,
			selectBlock,
			updateBlockAttributes,
		} = dispatch( 'core/block-editor' );

		return {
			mergeBlocks( forward ) {
				const { clientId } = ownProps;
				const {
					getPreviousBlockClientId,
					getNextBlockClientId,
				} = select( 'core/block-editor' );

				if ( forward ) {
					const nextBlockClientId = getNextBlockClientId( clientId );
					if ( nextBlockClientId ) {
						mergeBlocks( clientId, nextBlockClientId );
					}
				} else {
					const previousBlockClientId = getPreviousBlockClientId(
						clientId
					);
					if ( previousBlockClientId ) {
						mergeBlocks( previousBlockClientId, clientId );
					}
				}
			},
			onInsertBlocks( blocks, index ) {
				insertBlocks( blocks, index, ownProps.rootClientId );
			},
			onSelect( clientId = ownProps.clientId, initialPosition ) {
				selectBlock( clientId, initialPosition );
			},
			onChange: ( attributes ) => {
				updateBlockAttributes( ownProps.clientId, attributes );
			},
			onReplace( blocks, indexToSelect ) {
				replaceBlocks( [ ownProps.clientId ], blocks, indexToSelect );
			},
		};
	} ),
	withPreferredColorScheme,
] )( BlockListBlock );
