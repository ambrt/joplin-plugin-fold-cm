
// Content scripts that extend the funcitonality of codemirror will need to have the exact signature 

import { Console } from "node:console";
import { disconnect } from "node:process";

// below. 
function plugin(CodeMirror) {

	let indicator = "."
	CodeMirror.defineExtension('persistentFolding', function() {
		
		this.on('change', on_change);
		this.on('update', on_change);
		
		this.on("gutterClick", on_gutter);
		
	
		
	});
	
	function on_gutter(cm, lineNr, gutter){
		console.log('gutter line clicked')
		let doc = cm.getDoc()

		

		let line = doc.getLineHandle(lineNr)
		if("gutterMarkers" in line){
			if("CodeMirror-foldgutter" in line.gutterMarkers){
		

		let lineOldText = line.text
		
		let lastChar = lineOldText.charAt(lineOldText.length-1)
		//TODO: check if gutter click is only on headdings or normal lines too
		if(lastChar==indicator){
			let lastLength = lineOldText.length
			doc.replaceRange(lineOldText.slice(0,-1),{line:lineNr, ch:0 },{line:lineNr, ch:lastLength})
		}else{
			let lastLength = lineOldText.length
			doc.replaceRange(lineOldText+indicator,{line:lineNr, ch:0 },{line:lineNr, ch:lastLength+1})
		}
	}}
		//let marks = doc.getAllMarks()
	}
	function on_change(cm, change) {
		console.log("change")
		// Changed note here
		// Fold all to be folded
	let doc = cm.getDoc()
	//console.log(doc)
	//console.log(change)
	let res = {
        value: cm.getValue(),
        selections: doc.listSelections(),
        marks: [], 
		allCollapsible:[]
      };
	
	let marks = doc.getAllMarks()
	/*
	if ( marks.length ){
		// We reverse the array in order to start in the last folded parts in case of nesting
		for ( var i = marks.length - 1; i >= 0; i-- ){
			//res.marks.push(marks[i].find().from);
			
		  if ( marks[i].collapsed && (marks[i].type === 'range') ){
			res.marks.push(marks[i].find().from);
			console.log(doc.getLine(marks[i].find().from.line))


		  }
		  
		}
		
	  }
	  */
	 console.log(marks.length)
	 if(marks.length==0){
		let guttered = []
		function myLine(line){
		  if("gutterMarkers" in line){
			  if("CodeMirror-foldgutter" in line.gutterMarkers){
				  //console.log(line)
				  let lineNumber = doc.getLineNumber(line)
				  //cm.foldCode(CodeMirror.Pos(lineNumber))
				  guttered.push({line:line, ln:lineNumber})
			  }
		  }
		  
			
		}
		doc.eachLine(myLine)
		console.log(guttered)
		if ( guttered.length ){
		  // We reverse the array in order to start in the last folded parts in case of nesting
		  for ( var i = guttered.length - 1; i >= 0; i-- ){
  
			  let line = guttered[i].line
			  let lineOldText = line.text
			  
			  let lastChar = lineOldText.charAt(lineOldText.length-1)
			  
			  if(lastChar==indicator){
				  
				  cm.foldCode(CodeMirror.Pos(guttered[i].ln,guttered[i].line.text.length))		
				  
			  }
	  
  
			
			
		  }
		  
		}

	 }
	  

	}
	
	CodeMirror.defineOption('enable-folding-mode', false, async function(cm, val, old) {
		// Cleanup
		if (old && old != CodeMirror.Init) {
			cm.off('change', on_change);
		

		}
		// setup
		if (val) {
			// There is a race condition in the Joplin initialization code
			// Sometimes the settings aren't ready yet and will return `undefined`
			// This code will perform an exponential backoff and poll settings
			// until something is returned
			async function backoff(timeout: number) {
				
					cm.persistentFolding()
				
			};
			// Set the first timeout to 50 because settings are usually ready immediately
			// Set the first backoff to (100*2) to give a little extra time
			setTimeout(backoff, 50, 100);
		}
	});


}
module.exports = {
	default: function(_context) { 
		return {
            plugin:plugin,
			// Some resources are included with codemirror and extend the functionality in standard ways
			// via plugins (called addons) which you can find here: https://codemirror.net/doc/manual.html#addons
			// and are available under the addon/ directory
			// or by adding keymaps under the keymap/ directory
			// or additional modes available under the mode/ directory
			// All are available in the  CodeMirror source: https://github.com/codemirror/codemirror
			codeMirrorResources: ['addon/fold/foldgutter','addon/fold/markdown-fold'],
			// Often addons for codemirror need to be enabled using an option,
			// There is also certain codemirror functionality that can be enabled/disabled using
			// simple options
			codeMirrorOptions: {
                foldGutter: true,
				'enable-folding-mode': true,
                gutters: ["CodeMirror-foldgutter"]

            },
			// More complex plugins (and some addons) will require additional css styling
			// which is available through the assets function. As seen below, this styling can
			// either point to a css file in the plugin src directory or be included inline.
			assets: function() {
				return [
					{name:"foldgutter.css"}
				];
			},
		}
	},
}