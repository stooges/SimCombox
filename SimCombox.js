/**
 * @author LiuChen
 *
 * Html组合框
 * @author liuchen
 * 
 * 一、功能：
 * 给定文本框id，设置数据，以及一些简单的配置项（可省略），即可使文本框具有下拉列表的效果，支持手机端。
 * 功能与Html5 的datalist类似，但更强大，而且支持所有浏览器。依赖于Jquery，支持动态html页面。
 * 
 * 二、使用说明：
 * 1. 在页面中引用Jquery，以及SimCombox.js。
 * 2. 在script中定义SibCombox即可
 * 		$("#inputbox_id").SimCombox(data,setting);
 *		参数说明：
 *			inputbox_id----  输入框的id
 *			data       ----  需要在下拉列表中显示的数据，如
 *							 显示一列数据  ['item1','item2','item3']
 *							 显示多列数据  [ 
 *											['item11','item12','item13'],
 *											['item21','item22','item23'],
 *											['item31','item32','item33']
 *										 ]
 *									  或 [
 *											{key1:'value11',key2:'value12',key3:'value13'},
 *											{key1:'value21',key2:'value22',key3:'value23'},
 *											{key1:'value31',key2:'value32',key3:'value33'}
 *										 ]
 *			setting    ---   参数
 *								{
 *									allowNew:true,				//输入框中是否允许输入不包含在列表中的数据
 *									maxHeight:180,				//输入框显示的最大高度，单位为px
 *									value:'key1',				//如果为多列数据，则指出输入框中需要的列，
 * 																//	如果为空则将全部列值显示（逗号分隔,如"value1,value2,value3"）
 *									hide:['key2','key3']		//如果为多列数据，则指出需要被隐藏的列，默认为空数组
 *									onSelect: function(e,data){	//列表选项被选中后的回调函数 onSelectFun(e,data)，默认为空函数
 * 										//参数 e : 当前被点击的行对象，为表格的一行 <tr text='value1' dataId='data_id'> ...  </tr>
 * 										//参数 data : 被点击行所对应的输入参数dataArray中的数据，
 *  									//		如 'item1' 或 ['item11','item12','item13'] 或 
 * 										//		{key1:'value11',key2:'value12',key3:'value13'}
 * 									}
 * 								}
 * 3. Demo
 * 假设页面中有id=inputbox的输入框
 * (1) 基本使用
 * 		$("#inputbox").SimCombox(['item1','item2','item3']);
 * (2) 三列数据，第一列为需要输入的数据，并且在列表中隐藏，点击后alert对应的数据
 * 		$("#inputbox").SimCombox(
 * 						[
 * 							['item11','item12','item13'],
 *							['item21','item22','item23'],
 *							['item31','item32','item33']
 *						],
 *						{
 * 							value: '0',hide:['0'],
 * 							onSelect:function(e,data){
 *								alert(data);
 *							}
 * 						}
 *		);
 * (3) 三列数据第key1列为需要输入的数据，key2列在列表中隐藏，列表最大高度300px，不允许输入选项之外的数据
 * 		$("#inputbox").SimCombox(
 *  					[
 *							{key1:'value11',key2:'value12',key3:'value13'},
 *							{key1:'value21',key2:'value22',key3:'value23'},
 *							{key1:'value31',key2:'value32',key3:'value33'}
 *						],
 * 						{value: 'key1',hide:['key2'],maxHeight:300,allowNew:false}
 * 		);
 * 
 */
;(function($, window, document, undefined){
	/**
	 * 返回组合框对象
 	 * @param {Object} options
	 */
	$.fn.SimCombox=function(data, options){
		if(data==null){
			alert("Dataset is needed!");
			return;
		}
		var simCombox=new SimCombox(this, data, options);
		return simCombox;
	};
	
	var SimCombox = function($inputbox, data, options){
		/**默认值**/
		this.settings={
				value:"",      //下拉框中的哪一列为“值”
				hide:[],        //哪些列不显示
				allowNew:false, //是否允许用户自主输入新值
				maxHeight:185,  //下拉框最大高度
				onSelect:function(){}
			};
		if(options){
			$.extend(this.settings,options);
		}
		
		var combox = this;
		combox.$inputbox = $inputbox;
		combox.listId = ("#simbox"+Math.random()).replace('.', '');
		combox.data = data;
		combox.placeholder = $inputbox.attr('placeholder');//输入框原placeholder属性值
		combox.mobile = this.isMobile();
		combox.valueSet = combox.createValueSet(data);
		combox.$e = null; //记录被选取的行
		var content = "<table style='width:100%;'>"+ combox.createContent(data)+"</table>";
		
		
		//输入框输入事件，根据输入内容匹配刷新列表
		$(combox.getPath($inputbox)).on('input propertychange',function(){
			combox.refreshList();
		});
		if(combox.mobile){
			var touch_time=null;

			//触摸开始，记录当前时间，改变行背景色
			$('body').on('touchstart',combox.listId+" tr",function(){
				touch_time=new Date();
				$(this).css('background','#E0E0E0');
			});
			
			//触摸结束，判断是否点击，如果是点击设置值并清除列表
			$('body').on('touchend',combox.listId+" tr",function(){
				var t_span=(new Date)-touch_time;
				touch_time=null;
				$(this).css('background','white');
				if(t_span<200){
					combox.$e=$(this);
					combox.putTextInMobile(this);
					$(combox.listId).remove();
					combox.$inputbox.attr('placeholder',combox.placeholder); //恢复placeholder
				}
			});
			
			//移动
			$('body').on('touchmove',function(e){
				combox.resize();
			});
			
			//当输入框失去焦点时，清除下拉列表
			$(combox.getPath($inputbox)).on('blur',function(){
				if(combox.settings['allowNew']==false){//如果不允许自主输入值
					var value=combox.$inputbox.val();
					if(combox.valueSet.indexOf(value)<0 && value!=null && value.length>0){
						combox.$inputbox.attr('placeholder','内容不存在，请重新选择'); //利用placeholder提示
						combox.$inputbox.val('');
					}
				}
				$(combox.listId).remove();
			});
			
			//当点击了输入框，清除或显示下拉列表
			$(combox.getPath($inputbox)).on('touchstart',function(){
				if($(combox.listId).length>0)
					$(combox.listId).remove();
				else
					combox.showList(content);
			});
		}else{
			//输入框获取焦点时，显示下拉框列表
			$(combox.getPath($inputbox)).on('focus',function(){
				combox.showList(content);
				combox.$list=$(combox.listId);//获取对象，否则在手机动态方法中无法正确的获取！
			});
			
			//当浏览器大小变动时
			$(window).resize(function(){
				combox.resize();
			});
			
			//鼠标漂过行时，改变行颜色，并记下该行
			$('body').on('mouseover',combox.listId+" tr",function(e){
				$(this).css('background','#E0E0E0');
				combox.$e=$(this);
			});
			//鼠标离开行时，恢复行颜色
			$('body').on('mouseleave',combox.listId+" tr",function(e){
				$(this).css('background','white');
			});
			
			//鼠标离开列表，则清空被记录的值
			$('body').on('mouseleave',combox.listId,function(e){
				combox.$e=null;
			});
			
			//当输入框失去焦点，设置所选的值，并关闭列表
			$(combox.getPath($inputbox)).on('blur',function(){
				combox.putTextInPC();
				combox.$e=null;
				$(combox.listId).remove();
			});
		}
	};

	
	SimCombox.prototype={
		/**
		 * 手机端显示被选择的值
		 */
		putTextInMobile : function(e) {
			if (this.$inputbox == null) {
				return;
			}
			var onSelectFun = this.settings["onSelect"];
			var data = this.data;
			var dataId = this.$e.attr("dataId");
			this.$inputbox.val(this.$e.attr('text'));
			onSelectFun(e, data[dataId]);
		},
		
		/**
		 * PC端显示被选择的值
		 */
		putTextInPC : function(){
			if(this.$inputbox==null){
				return;
			}
			var onSelectFun=this.settings["onSelect"];
			
			if(this.settings['allowNew']==false){//如果不允许自主输入值
				var value=this.$inputbox.val();
				if(this.$e!=null){//如果鼠标曾进入过下拉列表
					this.$inputbox.val(this.$e.attr("text"));
					var dataId=this.$e.attr("dataId");
					onSelectFun(this.$e,this.data[dataId]);				//运行点击事件----
					this.$inputbox.attr('placeholder',this.placeholder);	//恢复原placeholder
				}else if(this.valueSet.indexOf(value)<0 && value!=null && value.length>0){
					this.$inputbox.attr('placeholder','内容不存在，请重新选择'); //利用placeholder提示
					this.$inputbox.val('');
				}
			}else{				//如果允许自主输入值
				if(this.$e!=null){//如果鼠标曾进入过下拉列表
					this.$inputbox.val(this.$e.attr("text"));
					var dataId=this.$e.attr("dataId");
					onSelectFun(this.$e,this.data[dataId]);				//运行点击事件----
					this.$inputbox.attr('placeholder',this.placeholder);	//恢复原placeholder
				}
			}
			this.$e=null;
		},
		
		/**
		 * 浏览器大小变化时
		 */
		resize : function(){
			if(!this.$list){//当一个窗口有多个combox时，窗口resize时，所有元素的事件都会被触发，如果其还没有显示出来，就会出错
				return;
			}
			var lleft=this.$inputbox.offset().left;
			var ttop=this.$inputbox.offset().top+this.$inputbox.outerHeight();
			var min_width=this.$inputbox.outerWidth();
			var max_width=window.width-lleft-15;
			var list_id=this.listId;
			
			this.$list.css('left',lleft+"px");
			this.$list.css('top',ttop+"px");
			this.$list.css('min-width',min_width+"px");
			this.$list.css('max-width',max_width+"px");
		},
		/**
		 * 当输入框值变动时刷新列表
		 */
		refreshList : function(){
			var data=this.data;
			var value=this.$inputbox.val();
			var content=this.createContent(data,value);
			if($(this.listId).length<=0){
				this.showList("<table style='width:100%;'>"+ content+"</table>");
			}else{
				$(this.listId+" table").html(content);
				$(this.listId+" td").attr('style','padding-left:10px;padding-right:10px;');
			}
		},
		
		/**
		 * 显示下拉列表
		 */
		showList : function(content){
			var lleft=this.$inputbox.offset().left;
			var ttop=this.$inputbox.offset().top+this.$inputbox.outerHeight();
			var min_width=this.$inputbox.outerWidth();
			var max_width=window.width-lleft-15;
			var list_id=this.listId;
			
			var bcolor = this.$inputbox.css("border-color");
			var	bborder = this.$inputbox.css("border");
			var sim_border='solid 1px ';
			if(bcolor)
				sim_border+=bcolor;
			else if(bborder){
				sim_border = bborder.replace(/\dpx/,"1px");
			}else{
				sim_border+="#ADADAD";
			}
			
			$("body").append("<div id='"+list_id.replace('#','')
							+"' style='overflow:auto;position:absolute;min-width:"
							+min_width+"px;max-width:"+max_width+"px;max-height:"
							+this.settings['maxHeight']+"px;left:"+lleft+"px;top:"+ttop
							+"px;z-index:2147483646; background:white;border:"
							+sim_border+";'>"+content+"</div>");
			$(list_id+" td").attr('style','padding-left:10px;padding-right:10px;');
		},
		
		
		
		/**
		 * 创建全部备选值集合，用于确定是否允许用户自主输入新值
		 */
		createValueSet : function(data){
			return this._createContentAndValueSet(data)["valueSet"];
		},
		
		/**
		 * 创建下拉列表中的行<tr>
		 * @data 数据
		 * @filter 过滤值
		 */
		createContent : function(data,filter){
			return this._createContentAndValueSet(data,filter)["content"];
		},
		
		/**
		 * 创建下拉列表中的行，以及全部备选值
		 */
		_createContentAndValueSet : function(data, filter){
			if(!filter) filter = "";
			var content="";
			var valueSet=[];
			for(var i in data){
				if(this.settings["value"]==null || this.settings["value"].length == 0){ //如果设置了值列
					if(typeof data[i]=="object"){//如果为对象
						var text="";
						var tds="";
						var tds_str="";
						for(var k in data[i]){
							if(this.settings["hide"].indexOf(k)<0){
								text+=data[i][k]+",";
								tds+="<td>"+data[i][k]+"</td>";
								tds_str+=data[i][k];
							}
						}
						text=text.substr(0,text.length-1);
						valueSet.push(text);
						if(tds_str.indexOf(filter)>=0)	
							content+="<tr text='"+text+"' dataId='"+i+"'>"+tds+"</tr>";
					}else{
						var text=data[i];
						valueSet.push(text);		
						if(text.indexOf(filter)>=0)	
							content+="<tr text='"+data[i]+"' dataId='"+i+"'><td>"+data[i]+"</td></tr>";
					}
				}else{
					if(typeof data[i]=="object"){//如果为对象
						var text=data[i][this.settings['value']];
						var tds="";
						var tds_str="";
						for(var k in data[i]){
							if(this.settings["hide"].indexOf(k)<0){
								tds+="<td>"+data[i][k]+"</td>";
								tds_str+= data[i][k];
							}
						}
						valueSet.push(text);
						if(tds_str.indexOf(filter)>=0)	
							content+="<tr text='"+text+"' dataId='"+i+"'>"+tds+"</tr>";
					}else{
						var text=data[i];
						valueSet.push(text);
						if(text.indexOf(filter)>=0)	
							content+="<tr text='"+data[i]+"' dataId='"+i+"'><td>"+data[i]+"</td></tr>";
					}
				}
			}
			return {content:content,valueSet:valueSet};
		},
		
		/**
		 * 判断是否手机端
		 */
		isMobile : function (){
			if(/AppleWebKit.*Mobile/i.test(window.navigator.userAgent) 
					|| /Android/i.test(window.navigator.userAgent) 
					|| /BlackBerry/i.test(window.navigator.userAgent) 
					|| /IEMobile/i.test(window.navigator.userAgent) 
					|| (/MIDP|SymbianOS|NOKIA|SAMSUNG|LG|NEC|TCL|Alcatel|BIRD|DBTEL|Dopod|PHILIPS|HAIER|LENOVO|MOT-|Nokia|SonyEricsson|SIE-|Amoi|ZTE/.test(navigator.userAgent))){
				if(/iPad/i.test(window.navigator.userAgent)){
					return true;//IPad
				}else{
					return true;//其他移动端
				}
			}else{
				return false;
			}
		},
		
		getPath: function ($element) {
    		if($element.length != 1)
				throw 'Requires one element.';
			var path,node = $element;
			while (node.length) {
				var realNode = node[0], name = realNode.localName;
				if (!name)
					break;
				name = name.toLowerCase();
				var parent = node.parent();
				var siblings = parent.children(name);
				if (siblings.length > 1) {
					name += ':eq(' + siblings.index(realNode) + ')';
				}

				path = name + ( path ? '>' + path : '');
				node = parent;
			}
			return path;
		}
	};
})($, window, document);
