export default function ListItem( { children, noWrapList = false } ) {
	if ( children ) {
		const childNodes = children.map( ( childNode, index ) => {
			const { content, anchor } = childNode.block;

			const entry = anchor ? (
				<a
					className="wp-block-table-of-contents__entry"
					href={ anchor }
				>
					{ content }
				</a>
			) : (
				<span className="wp-block-table-of-contents__entry">
					{ content }
				</span>
			);

			return (
				<li key={ index }>
					{ entry }
					{ childNode.children ? (
						<ListItem>{ childNode.children }</ListItem>
					) : null }
				</li>
			);
		} );

		// Don't wrap the list elements in <ul> if converting to a core/list.
		return noWrapList ? childNodes : <ul>{ childNodes }</ul>;
	}
}