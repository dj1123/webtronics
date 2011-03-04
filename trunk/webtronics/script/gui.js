
var webtronics={
		circuit:null,


		
		docfromtext:function(txt){
			var xmlDoc;
			if (window.DOMParser){
				parser=new DOMParser();
				xmlDoc=parser.parseFromString(txt,"text/xml");
			}
			else{ // Internet Explorer
				xmlDoc=new ActiveXObject("Microsoft.XMLDOM");
				xmlDoc.async="false";
				xmlDoc.loadXML(txt);
			} 
			return xmlDoc;
		},

		setsize:function(){
		
			var buffer=20;
			var realsize=window.innerHeight-$('webtronics_toolbar').offsetHeight-$('webtronics_status_bar').offsetHeight-buffer;
			$('webtronics_diagram_area').style.height = realsize+'px';
		},

		showMarkup:function() {
			var str="<?xml version='1.0' ?>\n";
			str+="<!--Created by webtronics 0.1-->\n";
			str+=webtronics.circuit.getMarkup();
			var w=window.open("data:image/svg+xml;base64;charset=utf-8," + Utils.encode64(str) );
		},

		setMode:function(button,mode, status){

			var imgs = $('webtronics_toolbar').getElementsByTagName('img');
			for (var i=0; i<imgs.length; i++) {
				imgs[i].style.backgroundColor = '';
			}
			$(button).style.backgroundColor = 'grey';
			$('webtronics_status_bar').innerHTML = 'Mode: '+status;

			if(mode!='select'){
				if(webtronics.circuit.selected){
					webtronics.circuit.unselect();
				}
			}
			webtronics.circuit.mode=mode;

		},

		changeimage:function(Name){
			
			$('webtronics_part_display').src=Name;
			$('webtronics_part_display').hide();
			$('webtronics_part_display').show();
		},

		openfile:function(Name){
			var xmldoc;
			new Ajax.Request(Name,{
			method:'get',
			asynchronous:false,
			contentType:"image/svg+xml",
			onSuccess: function(transport){
				xmldoc=transport.responseXML;
				},
			onFailure: function(){ alert('Something went wrong...'); }
			//, onException: function(x){alert(" Error name: " + x.name  + ". Error message: " + x.message); }
			});
			return xmldoc;
		},

		returnpart:function(Name){
			var xmlDoc=webtronics.openfile(Name);
			webtronics.circuit.getgroup(xmlDoc.getElementsByTagName('g')[0]);
			$('webtronics_parts_box').hide();
			webtronics.setMode('webtronics_select','select','Selection');
		},	


		returnsvg:function(){
			if(window.FileReader){
				$('webtronics_open_file_selector').form.reset();
				$('webtronics_open_file').style.display = "block";
				$('webtronics_open_file_selector').onchange=function(){
					var textReader = new FileReader();
					textReader.onloadend=function(){
						var xmlDoc=webtronics.docfromtext(textReader.result);
						if(!xmlDoc){alert("error parsing svg");}
						else{
							var node=xmlDoc.getElementsByTagName('svg')[0];
							if(!node){alert("svg node not found")}
							else webtronics.circuit.getfile(node);
						}
					}
					textReader.readAsText($('webtronics_open_file_selector').files[0]);
					$('webtronics_open_file').hide();
				}
			}
			else if(((navigator.userAgent.toLowerCase().indexOf('firefox')>-1)||
				(navigator.userAgent.toLowerCase().indexOf('iceweasel')>-1))	 &&window.FileList){

			$('webtronics_open_file_selector').form.reset();
			$('webtronics_open_file').style.display = "block";
				$('webtronics_open_file_selector').onchange=function(){
					var txt =$('webtronics_open_file_selector').files[0].getAsText('');					
					var xmlDoc=webtronics.docfromtext(txt);
					var node=xmlDoc.getElementsByTagName('svg')[0];
					if(!node){alert("svg node not found");}
					else webtronics.circuit.getfile(node);
					$('webtronics_open_file').hide();
				}
			}

			/*no file read capability*/

			else {
				$('webtronics_open_text_ok').onclick=function(){
					var xmlDoc=webtronics.docfromtext($('webtronics_svg_code').value);
					webtronics.circuit.getfile(xmlDoc.getElementsByTagName('svg')[0]);
					$('webtronics_open_text').hide();
				}
				$('webtronics_open_text').style.display = "block";

			}
			webtronics.setMode('webtronics_select','select','Selection');
		},


		returnchip:function(){
		webtronics.circuit.getgroup($('webtronics_chip_display').getElementsByTagName('g')[0]);
		$('webtronics_chips_box').hide();
		webtronics.setMode('webtronics_select','select','Selection');
		}
	
}




	Event.observe(window, 'load', function() {

		var url=window.location.search.toQueryParams();
		var file=url['file'];
		var code = url['code'];
		
		//document.oncontextmenu=new Function("return false");
		webtronics.circuit = new Schematic($('webtronics_diagram_area'));
	 	webtronics.setMode('webtronics_select','select', 'Selection');    
		webtronics.setsize();
		if(code){
			var xmlDoc=webtronics.docfromtext(Utils.decode64(code));
			if(!xmlDoc)alert("data opening error");
			else{
					var node=xmlDoc.getElementsByTagName('svg')[0]
					if(!node){alert("code svg node not found");}
					else	webtronics.circuit.getfile(node);
				}
		}
		else if(file){
				var xmlDoc=webtronics.openfile(file);
				if(!xmlDoc){alert("file opening error");}
				else{
					var node=xmlDoc.getElementsByTagName('svg')[0]
					if(!node){alert("file svg node not found");}
					else	webtronics.circuit.getfile(node);
				}
		}
/*menu events*/
		Event.observe($('webtronics_file_open'), 'click', function() {
			webtronics.setMode('webtronics_file_open','select','Selection');
			webtronics.returnsvg();
			});
		Event.observe($('webtronics_new'), 'click', function() {
			webtronics.setMode('webtronics_select','select','Selection');
			input_box=confirm("Click OK to Continue");
			if (input_box==true)webtronics.circuit.newdoc();
			});
		Event.observe($('webtronics_chips_open'), 'click', function() {
//			$('webtronics_chips_box').reset();
			webtronics.circuit.clearinfo();
			webtronics.setMode('webtronics_chips_open','select','Selection');
			$('webtronics_chips_box').style.display = "block";
			});
		Event.observe($('webtronics_parts_open'), 'click', function() {
			chipmaker.drawchip($('webtronics_hor_pins').value,$('webtronics_vert_pins').value,$('webtronics_chip_display'));
			webtronics.setMode('webtronics_parts_open','select','Selection');
			$('webtronics_parts_box').style.display = "block";
			});
		Event.observe($('webtronics_zoom'), 'click', function() {
				//set zoom to 1
				webtronics.circuit.clearinfo();
				webtronics.circuit.setzoom(false);
				webtronics.setMode('webtronics_zoom','zoom', 'Zoom');
			});
		Event.observe($('webtronics_select'), 'click', function() {
				webtronics.circuit.clearinfo();
				webtronics.setMode('webtronics_select','select', 'Selection');
			});
		Event.observe($('webtronics_wire'), 'click', function() {
				webtronics.circuit.clearinfo();
				webtronics.setMode('webtronics_wire','line');
			});
		Event.observe($('webtronics_text'), 'click', function() {
			webtronics.circuit.clearinfo();
			webtronics.setMode('webtronics_text','select', 'Selection');
			$('webtronics_add_text').style.display = "block";
			});
		Event.observe($('webtronics_delete'), 'click', function() {
			webtronics.circuit.clearinfo();
			webtronics.circuit.deleteSelection();
			});
		Event.observe($('webtronics_save'), 'click', function() {
		//	webtronics.saveserver();
			webtronics.circuit.clearinfo();
			webtronics.showMarkup();
			});
		$('webtronics_invert').checked=false;
		Event.observe($('webtronics_invert'),'click',function(){
				webtronics.circuit.clearinfo();
				webtronics.circuit.invertcolors($('webtronics_invert').checked);
			});
		$('webtronics_connections').checked=false;
		Event.observe($('webtronics_connections'),'click',function(){
				webtronics.circuit.clearinfo();
				webtronics.circuit.showconnections($('webtronics_connections').checked);
						
				});
		
/*parts box events*/		
		Event.observe($('webtronics_part'), 'change', function() {
			webtronics.changeimage($('webtronics_part').value);
			});
		Event.observe($('webtronics_part_ok'), 'click', function() {
			webtronics.returnpart($('webtronics_part').value);
			});
		Event.observe($('webtronics_part_cancel'), 'click', function() {
			$('webtronics_parts_box').hide();
			webtronics.setMode('webtronics_select','select','Selection');
			});
/*file open events*/
		Event.observe($('webtronics_open_file_cancel'), 'click', function() {
			$('webtronics_open_file').hide();
			webtronics.setMode('webtronics_select','select','Selection');
		});
/*chip box events*/
		Event.observe($('webtronics_vert_pins'), 'change', function() {
			chipmaker.drawchip($('webtronics_hor_pins').value,$('webtronics_vert_pins').value,$('webtronics_chip_display'));
		});
		Event.observe($('webtronics_hor_pins'), 'change', function() {
			chipmaker.drawchip($('webtronics_hor_pins').value,$('webtronics_vert_pins').value,$('webtronics_chip_display'));
		});
		Event.observe($('webtronics_chip_ok'), 'click', function() {
			webtronics.returnchip();
			//chipmaker.clear();
		});
		Event.observe($('webtronics_chip_cancel'), 'click', function() {

			$('webtronics_chips_box').hide();
			webtronics.setMode('webtronics_select','select','Selection');
		});
/*text add events*/
		Event.observe($('webtronics_text_ok'), 'click', function() {
			webtronics.circuit.addtext($('webtronics_comment').value);
			$('webtronics_add_text').hide();
			webtronics.setMode('webtronics_select','select','Selection');
		});
		Event.observe($('webtronics_text_cancel'), 'click', function() {
			webtronics.setMode('webtronics_select','select','Selection');

			$('webtronics_add_text').hide();
		});
/*text open events*/
		Event.observe($('webtronics_open_text_ok'), 'click', function() {
			$('webtronics_open_text').hide();
		});
		Event.observe($('webtronics_open_text_cancel'), 'click', function() {
			webtronics.setMode('webtronics_select','select','Selection');

			$('webtronics_open_text').hide();
		});



	
});
	Event.observe(window, 'resize', function() {
		webtronics.setsize();
	});
//	window.addEventListener("oncontextmenu",function(){return false},true);

