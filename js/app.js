var URL = window.URL || window.webkitURL || window.mozURL || window.msURL;
navigator.saveBlob = navigator.saveBlob || navigator.msSaveBlob || navigator.mozSaveBlob || navigator.webkitSaveBlob;
window.saveAs = window.saveAs || window.webkitSaveAs || window.mozSaveAs || window.msSaveAs;

// Because highlight.js is a bit awkward at times
var languageOverrides = {
	js: 'javascript',
	html: 'xml'
}

marked.setOptions({
	highlight: function(code, lang){
		if(languageOverrides[lang]) lang = languageOverrides[lang];
		return hljs.LANGUAGES[lang] ? hljs.highlight(lang, code).value : code;
	}
});

function update(e){
	var val = e.getValue();

	setOutput(val);

	clearTimeout(hashto);
	hashto = setTimeout(updateHash, 1000);
}

function setOutput(val){
	val = val.replace(/<equation>((.*?\n)*?.*?)<\/equation>/ig, function(a, b){
		return '<img src="http://latex.codecogs.com/png.latex?' + encodeURIComponent(b) + '" />';
	});

	document.getElementById('out').innerHTML = marked(val);
}

var editor = CodeMirror.fromTextArea(document.getElementById('code'), {
	mode: 'gfm',
	lineNumbers: true,
	matchBrackets: true,
	lineWrapping: true,
	theme: 'default',
	onChange: update
});

document.addEventListener('drop', function(e){
	e.preventDefault();
	e.stopPropagation();

	var theFile = e.dataTransfer.files[0];
	var theReader = new FileReader();
	theReader.onload = function(e){
		editor.setValue(e.target.result);
	};

	theReader.readAsText(theFile);
}, false);

function save(){
	var code = editor.getValue();
	var blob = new Blob([code], { type: 'text/plain' });
	saveBlob(blob);
}

function saveBlob(blob){
	var name = "untitled.md";
	if(window.saveAs){
		window.saveAs(blob, name);
	}else if(navigator.saveBlob){
		navigator.saveBlob(blob, name);
	}else{
		url = URL.createObjectURL(blob);
		var link = document.createElement("a");
		link.setAttribute("href",url);
		link.setAttribute("download",name);
		var event = document.createEvent('MouseEvents');
		event.initMouseEvent('click', true, true, window, 1, 0, 0, 0, 0, false, false, false, false, 0, null);
		link.dispatchEvent(event);
	}
}

document.addEventListener('keydown', function(e){
	if(e.keyCode == 83 && (e.ctrlKey || e.metaKey)){
		e.preventDefault();
		save();
		return false;
	}
})

var hashto;

function updateHash(){
	window.location.hash = btoa(RawDeflate.deflate(unescape(encodeURIComponent(editor.getValue()))))
}

if(window.location.hash){
	var h = window.location.hash.replace(/^#/, '');
	if(h.slice(0,5) == 'view:'){
		setOutput(decodeURIComponent(escape(RawDeflate.inflate(atob(h.slice(5))))));
		document.body.className = 'view';
	}else{
		editor.setValue(decodeURIComponent(escape(RawDeflate.inflate(atob(h)))))
		update(editor);
		editor.focus();
	}
}else{
	update(editor);
	editor.focus();
}

var GoSquared = { acct: 'GSN-265185-D' };

var gui = require('nw.gui');
var menu = new gui.Menu({ type: 'menubar' });

var fileMenu = new gui.Menu();
fileMenu.append( new gui.MenuItem({ 
	label: "新建",
	click: function(){
		
	} 
}) );
fileMenu.append( new gui.MenuItem({ 
	label: "打开",
	click: function(){
		var chooser = document.querySelector("#openFileDialog");
		chooser.addEventListener("change", function(evt){
			var fs = require("fs");
			fs.readFile(this.value, "utf8", function(err, data){
				if (err) {
					throw err;
				}

				editor.setValue(data);
				// var doc = editor.getDoc();
				// doc.setValue("Data ....");
			});
		}, false);

		chooser.click();
	}
 }) );
fileMenu.append( new gui.MenuItem({ label: "最近打开的文件" }) );
fileMenu.append( new gui.MenuItem({ type: "separator" }) );
fileMenu.append( new gui.MenuItem({ 
	label: "保存",
	click: save 
}) );
fileMenu.append( new gui.MenuItem({ label: "另存为" }) );
fileMenu.append( new gui.MenuItem({ type: "separator" }) );
fileMenu.append( new gui.MenuItem({ label: "发送到" }) );
fileMenu.append( new gui.MenuItem({ 
	label: "导出为",
	click: function(){
		var chooser = document.querySelector("#saveFileDialog");
		chooser.addEventListener("change", function(evt){
			var markdownpdf = require("markdown-pdf");

			// var code = editor.getValue();
			var htmlValue = document.getElementById("out").innerHTML;
			
			var filePath = this.value;
			if (filePath.search(/.pdf$/i) < 0) {
				filePath = filePath + ".pdf"
			};
			markdownpdf({
				// preProcessHtml: function(){
				// 	var through = require("markdown-pdf/node_modules/through");
				// 	return through(function(data){
				// 		console.log(data);
				// 	});
				// }
				// cssPath: "default.css"
			}).from.string(htmlValue).to(filePath, function(){
				// console.log("Created");
			});
		}, false);
		chooser.click();
	} 
}) );
fileMenu.append( new gui.MenuItem({ label: "打印" }) );
fileMenu.append( new gui.MenuItem({ type: "separator" }) );
fileMenu.append( new gui.MenuItem({ label: "偏好设置" }) );

//先设置系统菜单才能让新添加的菜单出现在编辑菜单之前，奇怪的动作
gui.Window.get().menu = menu;

menu.insert(
		new gui.MenuItem({
			label: "文件",
			submenu: fileMenu
		}), 1
	);

var findMenu = new gui.Menu();
findMenu.append( new gui.MenuItem({ label: "查找" }) );
findMenu.append( new gui.MenuItem({ label: "上一个" }) );
findMenu.append( new gui.MenuItem({ label: "下一个" }) );
findMenu.append( new gui.MenuItem({ type: "separator" }) );
findMenu.append( new gui.MenuItem({ label: "替换" }) );
findMenu.append( new gui.MenuItem({ label: "全部替换" }) );

menu.insert(
		new gui.MenuItem({
			label: "查找",
			submenu: findMenu
		}), 3
	);

var insertMenu = new gui.Menu();
insertMenu.append( new gui.MenuItem({ label: "插入日期时间" }) );
insertMenu.append( new gui.MenuItem({ label: "当前文件名" }) );

menu.insert(
		new gui.MenuItem({
			label: "插入",
			submenu: insertMenu
		}), 4
	);

var viewMenu = new gui.Menu();
viewMenu.append( new gui.MenuItem({ label: "显示行号" }) );
viewMenu.append( new gui.MenuItem({ label: "全屏" }) );

menu.insert(
		new gui.MenuItem({
			label: "视图",
			submenu: viewMenu
		}), 5
	);

var helpMenu = new gui.Menu();
helpMenu.append( new gui.MenuItem({ label: "MoonPad帮助" }) );
helpMenu.append( new gui.MenuItem({ 
	label: "Markdown语法帮助",
	click: function(){
		gui.Window.open("html/markdown-help.html", {
			position: "center",
			width: 800,
			height: 600,
			toolbar: false
		});
	}
 }) );
helpMenu.append( new gui.MenuItem({ type: "separator" }) );
helpMenu.append( new gui.MenuItem({ 
	label: "MoonPad网站",
	click: function(){
		gui.Shell.openExternal("http://www.diveinedu.cn");
	}  
}) );
helpMenu.append( new gui.MenuItem({ label: "致谢" }) );
helpMenu.append( new gui.MenuItem({ type: "separator" }) );
helpMenu.append( new gui.MenuItem({ label: "检查更新" }) );
menu.append(
		new gui.MenuItem({
			label: "帮助",
			submenu: helpMenu
		})
	);
