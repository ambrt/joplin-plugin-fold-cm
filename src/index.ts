import joplin from 'api';
import { ContentScriptType } from 'api/types';
import { MenuItemLocation, ToolbarButtonLocation } from 'api/types';

joplin.plugins.register({
	onStart: async function() {
		await joplin.contentScripts.register(
			ContentScriptType.CodeMirrorPlugin,
			'folding',
			'./folding.js'
		); 
		await joplin.commands.register({
			name: 'foldAllByPlugin',
			label: 'Fold all ',
			execute: async () => {
				await joplin.commands.execute('editor.execCommand', {
					name: 'foldAllByPlugin',
					//name: 'foldAll',
					args: []
				});
			},
		});

		await joplin.commands.register({
			name: 'unfoldAllByPlugin',
			label: 'Unfold all ',
			execute: async () => {
				await joplin.commands.execute('editor.execCommand', {
					name: 'unfoldAllByPlugin',
					//name: 'foldAll',
					args: []
				});
			},
		});	


		await joplin.views.menuItems.create('foldAllMenuItem', 'foldAllByPlugin', MenuItemLocation.Tools, { accelerator: 'CmdOrCtrl+Shift+F' });
		await joplin.views.menuItems.create('unfoldAllMenuItem', 'unfoldAllByPlugin', MenuItemLocation.Tools, { accelerator: 'CmdOrCtrl+Shift+U' });


	},
});