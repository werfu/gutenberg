/**
 * @format
 * @flow
 */

import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import Toolbar from './toolbar';

export default class BlockHolder extends React.Component<
	{ index: number, blockType: string, content: string },
	{ selected: boolean, focused: boolean }
> {
	state = {
		selected: false,
		focused: true,
	};
	constructor( props: { index: number, blockType: string, content: string } ) {
		super( props );
	}

	renderToolbarIfBlockFocused() {
		if ( this.state.focused ) {
			return <Toolbar index={ this.props.index } />;
		} else {
			// Return empty view, toolbar won't be rendered
			return <View />;
		}
	}

	render() {
		// TODO: This is a place holder, this should call the edit() method of the block depending on this.props.blockType
		return (
			<View style={ styles.blockHolder }>
				<View style={ styles.blockTitle }>
					<Text>BlockType: { this.props.blockType }</Text>
				</View>
				<View style={ styles.blockContent }>
					<Text>{ this.props.content }</Text>
				</View>
				{ this.renderToolbarIfBlockFocused.bind( this )() }
			</View>
		);
	}
}

const styles = StyleSheet.create( {
	blockHolder: {
		flex: 1,
	},
	blockContent: {
		backgroundColor: 'white',
		padding: 10,
	},
	blockTitle: {
		backgroundColor: 'grey',
		paddingLeft: 10,
		paddingTop: 4,
		paddingBottom: 4,
	},
} );
