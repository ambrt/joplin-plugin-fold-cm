
// Content scripts that extend the funcitonality of codemirror will need to have the exact signature 
// below. 
function plugin(CodeMirror) {

	CodeMirror.defineExtension("foldAllByPlugin", function () {
		//"Ctrl-Y": cm => CodeMirror.commands.foldAll(cm),
		//Ctrl-I": cm => CodeMirror.commands.unfoldAll(cm),
		let cm = this
		let doc = cm.getDoc()
		cm.operation(function(){
		console.log("fold all by plugin")
		for (var l = cm.lastLine(); l >= cm.firstLine(); --l) {
			let lineText = cm.getLine(l)
			if (lineText.charAt(0) == "#" && lineText.indexOf(" ")>0 && lineText.charAt(lineText.length-1)!=".") {
				//console.log("line to fold in all")
				let line = cm.getLineHandle(l)
				//console.log(line)
				let lineNr = l;
				try {
					if ("gutterMarkers" in line) {
						if ("CodeMirror-foldgutter" in line.gutterMarkers) {


							
							//let lastLine = line.parent.lines[line.parent.lines.length - 1]
							
							let lastLength = lineText.length

							doc.replaceRange(lineText + indicator, { line: lineNr, ch: 0 }, { line: lineNr, ch: lastLength +1 })
							cm.foldCode(CodeMirror.Pos(lineNr, lastLength - 1), null, "fold");
						}
					}
				} catch (error) {
					console.log("fold all error");
					
					console.log(error)
				}
				//let marks = doc.getAllMarks()
			}






		}
	})

	})

	CodeMirror.defineExtension("unfoldAllByPlugin", function () {
		//"Ctrl-Y": cm => CodeMirror.commands.foldAll(cm),
		//Ctrl-I": cm => CodeMirror.commands.unfoldAll(cm),
		let cm = this
		let doc = cm.getDoc()
		console.log("unfold all by plugin")
		cm.operation(function(){
		for (var l = cm.lastLine(); l >= cm.firstLine(); --l) {
			let lineText = cm.getLine(l)
			if (lineText.charAt(0) == "#" && lineText.indexOf(" ") > 0) {
				//console.log("line to fold in all")
				let line = cm.getLineHandle(l)
				//console.log(line)
				let lineNr = l;
	
				let lastChar = lineText.charAt(lineText.length - 1)
				
				try {
					if ("gutterMarkers" in line) {
						if ("CodeMirror-foldgutter" in line.gutterMarkers) {

							let lastLength = lineText.length
							if (lastChar == indicator) {
								//unfold
								
								doc.replaceRange(lineText.slice(0, -1), { line: lineNr, ch: 0 }, { line: lineNr, ch: lastLength })
								
							} 
							cm.foldCode(CodeMirror.Pos(lineNr, lastLength - 1), null, "unfold");
						}
					}
				} catch (error) {
					console.log("unfold all error");
					
					console.log(error)
				}
				//let marks = doc.getAllMarks()
			}






		}
	})
	})

	



	let indicator = "."
	CodeMirror.defineExtension('persistentFolding', function () {

		//this.on('change', on_change);
		this.on("viewportChange", on_viewportChange)
		this.on("changes", on_changes)
		//this.on("viewportChange", on_change)
		//this.on("scroll", on_change)
		//this.on('update', on_change);
		//this.on('refresh', on_change);
		this.on("focus", on_change)

		this.on("gutterClick", on_gutter);
		console.log("folding is activated")
	});

	function on_gutter(cm, lineNr, gutter) {
		console.log('gutter line clicked')
		let doc = cm.getDoc()
		let line = doc.getLineHandle(lineNr)
		function myLine(lineEach) {

			if (lineEach.text.includes("![")) {
				// fix compatitiblity with RichMarkdown preview of image
				let richMdNr = doc.getLineNumber(lineEach)
				let nextRichMdNr = richMdNr + 1
				//console.log(line)
				try {
					let nextRichMdLine = doc.getLineHandle(nextRichMdNr)
					//console.log(nextRichMdLine)
					//console.log(nextRichMdLine.text.indexOf("#"))
					if (nextRichMdLine.text.indexOf("#") == 0) {
						let pos = { // create a new object to avoid mutation of the original selection
							line: lineEach.text,
							ch: lineEach.text.length - 1 // set the character position to the end of the line
						}
						doc.replaceRange("\n" + nextRichMdLine.text, { line: nextRichMdNr, ch: 0 }, { line: nextRichMdNr, ch: nextRichMdLine.text.length + 1 })
						cm.foldCode(CodeMirror.Pos(lineNr, lineEach.text.length))
						cm.foldCode(CodeMirror.Pos(lineNr, lineEach.text.length))

					}
				} catch (err) {
					
					console.log(err)
					let lastEditorLineNr = doc.lastLine()
					let lastEditorLine = doc.getLineHandle(lastEditorLineNr)
					console.log(lastEditorLine)
					doc.replaceRange(lastEditorLine.text + "\n", { line: lastEditorLineNr, ch: 0 }, { line: lastEditorLineNr, ch: lastEditorLine.text.length + 1 })
					cm.foldCode(CodeMirror.Pos(lineNr, lineEach.text.length))
					cm.foldCode(CodeMirror.Pos(lineNr, lineEach.text.length))
				}

			}

		}
		doc.eachLine(myLine)




		try {


			if ("gutterMarkers" in line) {
				if ("CodeMirror-foldgutter" in line.gutterMarkers) {


					let lineOldText = line.text
					//let lastLine = line.parent.lines[line.parent.lines.length - 1]
					let lastChar = lineOldText.charAt(lineOldText.length - 1)
					if (lastChar == indicator) {
						//unfold
						let lastLength = lineOldText.length
						doc.replaceRange(lineOldText.slice(0, -1), { line: lineNr, ch: 0 }, { line: lineNr, ch: lastLength })
						cm.foldCode(CodeMirror.Pos(lineNr, lastLength - 1), null, "unfold");
					} else {
						//fold


						let lastLength = lineOldText.length
						doc.replaceRange(lineOldText + indicator, { line: lineNr, ch: 0 }, { line: lineNr, ch: lastLength + 1 })

					}
				}
			}
		} catch (error) {
			console.log(error)
		}
		//let marks = doc.getAllMarks()
	}

	function on_changes(cm, cs) {

		//console.log("changes")
		//console.log(cs)
	}

	function on_viewportChange(cm, from, to) {
		//console.log(from, to)

		if (from == 0 && to < 300) {
			for (var l = cm.lastLine(); l >= cm.firstLine(); --l) {
				let lineText = cm.getLine(l)
				if (lineText.charAt(0) == "#" && lineText.charAt(lineText.length - 1) == ".") {
					// console.log("line to fold")
					let line = cm.getLineHandle(l)
					//console.log(line)

					if (typeof line.gutterMarkers != "undefined" && typeof line.gutterMarkers['CodeMirror-foldgutter'] != "undefined" && typeof line.gutterMarkers['CodeMirror-foldgutter'].className != "undefined" && line.gutterMarkers['CodeMirror-foldgutter'].className.includes("CodeMirror-foldgutter-folded")) {
						//console.log("its already folded")

					} else {
						//console.log("folding from viewport")
						cm.foldCode(CodeMirror.Pos(l, lineText.length), null, "fold");
					}
				}


			}
		}

	}
	function on_change(cm, change) {
		//console.log("change")
		//console.log(change)
		// Changed note here
		// Fold all to be folded
		let doc = cm.getDoc()
		//console.log(doc)
		//console.log(change)
		/*let res = {
			value: cm.getValue(),
			selections: doc.listSelections(),
			marks: [],
			allCollapsible: []
		};

		let marks = doc.getAllMarks()
		console.log("marks")
		console.log(marks)
		*/
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





		/*
				function doMarks() {
					//console.log("marks length")
					//console.log(marks.length)
					let toFold = []
					function myLine(line) {
						try {
							if ("gutterMarkers" in line) {
								if ("CodeMirror-foldgutter" in line.gutterMarkers) {
		
		
									if (line.gutterMarkers['CodeMirror-foldgutter'].className.includes("CodeMirror-foldgutter-folded")) {
										console.log("its already folded")
		
									} else {
										console.log("to check if to be folded")
										//console.log(line)
										let lineNumber = doc.getLineNumber(line)
										//cm.foldCode(CodeMirror.Pos(lineNumber))
										toFold.push({ line: line, ln: lineNumber })
									}
								}
							}
						} catch (err) {
							console.log(err)
						}
		
		
					}
		
		
		
					doc.eachLine(myLine)
					console.log("toFold")
					console.log(toFold)
		
		
		
					if (toFold.length >0) {
						// We reverse the array in order to start in the last folded parts in case of nesting
						for (var i = toFold.length - 1; i >= 0; i--) {
		
							let line = toFold[i].line
							let lineOldText = line.text
		
							let lastChar = lineOldText.charAt(lineOldText.length - 1)
		
							if (lastChar == indicator) {
								try {
								
											//console.log(line)
											//let lineNumber = doc.getLineNumber(line)
											//cm.foldCode(CodeMirror.Pos(lineNumber))
											
											cm.foldCode(CodeMirror.Pos(toFold[i].ln, line.text.length))
									
								} catch (err) {
									console.log(err)
								}
		
								
		
							}
		
		
		
		
						}
		
					}
		
				}
		try{
				if(change.removed[0]==change.text[0]+"." && change.removed[0].charAt(0)=="#" && change.text[0].charAt(0)=="#"){
					console.log("its unfolding")
		
				}
			   else if(change.removed[0]+"."==change.text[0] && change.removed[0].charAt(0)=="#" && change.text[0].charAt(0)=="#"){
				  console.log("its folding")
		
			  } else if(change.origin !== undefined){
				console.log("it has origin")
			  }
			  else{
				//doMarks()  
			  }
			}catch(err){
				console.log(err)
			}
		*/
		//cm.operation(function() { 
		//for (var l = cm.firstLine(); l <= cm.lastLine(); ++l) 
		//cm.foldCode({line: l, ch: 0}, null, "fold"); 

		for (var l = cm.lastLine(); l >= cm.firstLine(); --l) {
			let lineText = cm.getLine(l)
			if (lineText.charAt(0) == "#" && lineText.charAt(lineText.length - 1) == ".") {
				// console.log("line to fold")
				let line = cm.getLineHandle(l)
				//console.log(line)

				if (typeof line.gutterMarkers != "undefined" && typeof line.gutterMarkers['CodeMirror-foldgutter'] != "undefined" && typeof line.gutterMarkers['CodeMirror-foldgutter'].className != "undefined" && line.gutterMarkers['CodeMirror-foldgutter'].className.includes("CodeMirror-foldgutter-folded")) {
					//console.log("its already folded on focus")

				} else {
					//console.log("folding on focus")
					cm.foldCode(CodeMirror.Pos(l, 0));
				}
			}


		}


		let toFold = []
		/*
		function myLine(line) {
			try {
				if ("gutterMarkers" in line) {
					if ("CodeMirror-foldgutter" in line.gutterMarkers) {


						if (line.gutterMarkers['CodeMirror-foldgutter'].className.includes("CodeMirror-foldgutter-folded")) {
							console.log("its already folded")

						} else {
							console.log("to check if to be folded")
							//console.log(line)
							let lineNumber = doc.getLineNumber(line)
							//cm.foldCode(CodeMirror.Pos(lineNumber))
							toFold.push({ line: line, ln: lineNumber })
						}
					}
				}
			} catch (err) {
				console.log(err)
			}


		}



		//doc.eachLine(myLine)*/
		//console.log("toFold")
		//console.log(toFold)


		/*
		if (toFold.length >0) {
			// We reverse the array in order to start in the last folded parts in case of nesting
			for (var i = toFold.length - 1; i >= 0; i--) {

				let line = toFold[i].line
				let lineOldText = line.text

				let lastChar = lineOldText.charAt(lineOldText.length - 1)

				if (lastChar == indicator) {
					try {
					
								//console.log(line)
								//let lineNumber = doc.getLineNumber(line)
								//cm.foldCode(CodeMirror.Pos(lineNumber))
								
								cm.foldCode(CodeMirror.Pos(toFold[i].ln, line.text.length))
						
					} catch (err) {
						console.log(err)
					}

					

				}




			}
		}

*/


		// });




		//cm.operation(doMarks)

		/*
		
			if (marks.length == 0 && false) {
				
				function myLine(line) {
					try{
					if ("gutterMarkers" in line) {
						if ("CodeMirror-foldgutter" in line.gutterMarkers) {
							//console.log(line)
							let lineNumber = doc.getLineNumber(line)
							//cm.foldCode(CodeMirror.Pos(lineNumber))
							guttered.push({ line: line, ln: lineNumber })
						}
					}
				}catch(err){
					console.log(err)
				}
					
			
				}
				
				if (guttered.length) {
					// We reverse the array in order to start in the last folded parts in case of nesting
					for (var i = guttered.length - 1; i >= 0; i--) {
	
						let line = guttered[i].line
						let lineOldText = line.text
	
						let lastChar = lineOldText.charAt(lineOldText.length - 1)
	
						if (lastChar == indicator) {
	
							cm.foldCode(CodeMirror.Pos(guttered[i].ln, guttered[i].line.text.length))
	
						}
	
	
	
	
					}
	
				}
	
			}
	*/

	}

	CodeMirror.defineOption('enable-folding-mode', false, async function (cm, val, old) {
		// Cleanup
		if (old && old != CodeMirror.Init) {
			cm.off('change', on_change);
			cm.off('update', on_change);
			cm.off('viewportChange', on_change);


		}
		// setup
		if (val) {
			// There is a race condition in the Joplin initialization code
			// Sometimes the settings aren't ready yet and will return `undefined`
			// This code will perform an exponential backoff and poll settings
			// until something is returned
			async function backoff(timeout: number) {

				cm.persistentFolding()
				//cm.myFoldAll()

			};
			// Set the first timeout to 50 because settings are usually ready immediately
			// Set the first backoff to (100*2) to give a little extra time
			setTimeout(backoff, 150, 100);
		}
	});


}
module.exports = {
	default: function (_context) {
		return {
			plugin: plugin,
			// Some resources are included with codemirror and extend the functionality in standard ways
			// via plugins (called addons) which you can find here: https://codemirror.net/doc/manual.html#addons
			// and are available under the addon/ directory
			// or by adding keymaps under the keymap/ directory
			// or additional modes available under the mode/ directory
			// All are available in the  CodeMirror source: https://github.com/codemirror/codemirror
			codeMirrorResources: ['addon/fold/foldgutter', 'addon/fold/markdown-fold'],
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
			assets: function () {
				return [
					{ name: "foldgutter.css" }
				];
			},
		}
	},
}