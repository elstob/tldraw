import { getLicenseKey } from '@tldraw/dotcom-shared'
import {
	DefaultContextMenu,
	DefaultContextMenuContent,
	TLComponents,
	Tldraw,
	TldrawUiMenuActionCheckboxItem,
	TldrawUiMenuActionItem,
	TldrawUiMenuGroup,
	track,
	useEditor,
} from 'tldraw'
import 'tldraw/tldraw.css'
import { trackedShapes, useDebugging } from '../hooks/useDebugging'
import { usePerformance } from '../hooks/usePerformance'
import { getDiff } from './diff'

const ContextMenu = track(() => {
	const editor = useEditor()
	const oneShape = editor.getOnlySelectedShape()
	const selectedShapes = editor.getSelectedShapes()
	const tracked = trackedShapes.get()
	return (
		<DefaultContextMenu>
			<DefaultContextMenuContent />
			{selectedShapes.length > 0 && (
				<TldrawUiMenuGroup id="debugging">
					<TldrawUiMenuActionItem actionId="log-shapes" />
					{oneShape && (
						<TldrawUiMenuActionCheckboxItem
							checked={tracked.includes(oneShape.id)}
							actionId="track-changes"
						/>
					)}
				</TldrawUiMenuGroup>
			)}
		</DefaultContextMenu>
	)
})

const components: TLComponents = {
	ContextMenu,
}

function afterChangeHandler(prev: any, next: any) {
	const tracked = trackedShapes.get()
	if (tracked.includes(next.id)) {
		// eslint-disable-next-line no-console
		console.table(getDiff(prev, next))
	}
}

function ExamplePanel() {
	return (
		<div
			style={{
				background: 'white',
				position: 'absolute',
				left: '100px',
				top: '100px',
				padding: '10px',
				height: '200px',
				width: '200px',
				zIndex: 500,
			}}
		>
			<div
				draggable
				onDragStart={(ev) => {
					ev.dataTransfer.setData('text', 'Red box')
				}}
				style={{
					background: 'red',
					display: 'inline-block',
					padding: '5px',
				}}
			>
				Drag me onto canvas
			</div>
			<div
				draggable
				onDragStart={(ev) => {
					ev.dataTransfer.setData('text', 'https://www.youtube.com/watch?v=NGOq0QoYW2U')
				}}
				style={{
					background: 'blue',
					display: 'inline-block',
					padding: '5px',
				}}
			>
				I give a URL
			</div>

			<div
				draggable
				onDragStart={(ev) => {
					ev.dataTransfer.setData(
						'text/html',
						'<p>This is a sample paragraph with some <strong>bold text</strong> and a <a href="https://example.com">link</a>.</p>'
					)
				}}
				style={{
					background: 'yellow',
					display: 'inline-block',
					padding: '5px',
				}}
			>
				I give HTML
			</div>
		</div>
	)
}

export default function Develop() {
	const performanceOverrides = usePerformance()
	const debuggingOverrides = useDebugging()
	return (
		<div className="tldraw__editor">
			<Tldraw
				licenseKey={getLicenseKey()}
				overrides={[performanceOverrides, debuggingOverrides]}
				persistenceKey="example"
				onMount={(editor) => {
					;(window as any).app = editor
					;(window as any).editor = editor
					const dispose = editor.store.sideEffects.registerAfterChangeHandler(
						'shape',
						afterChangeHandler
					)
					return () => {
						dispose()
					}
				}}
				components={components}
			>
				<ExamplePanel />
			</Tldraw>
		</div>
	)
}
