# SimCombox
Simple and perfect HTML combox.

##一、功能：
给定文本框id，设置数据，以及一些简单的配置项（可省略），即可使文本框具有下拉列表的效果，支持手机端。
功能与Html5 的datalist类似，但更强大，而且支持所有浏览器。依赖于Jquery，支持动态html页面。

##二、使用说明：
###1. 引用JS
在页面中引用Jquery，以及SimCombox.js。
###2. 在script中定义SibCombox即可
		$("#inputbox_id").SimCombox(data,setting);
 	  参数说明：
 		inputbox_id----  输入框的id
 		data       ----  需要在下拉列表中显示的数据，如
 						 显示一列数据  ['item1','item2','item3']
 						 显示多列数据  [ 
 										['item11','item12','item13'],
 										['item21','item22','item23'],
 										['item31','item32','item33']
 									 ]
 								  或 [
 										{key1:'value11',key2:'value12',key3:'value13'},
 										{key1:'value21',key2:'value22',key3:'value23'},
 										{key1:'value31',key2:'value32',key3:'value33'}
 									 ]
 		setting    ---   参数
 							{
 								allowNew:true,				//输入框中是否允许输入不包含在列表中的数据
 								maxHeight:180,				//输入框显示的最大高度，单位为px
 								value:'key1',				//如果为多列数据，则指出输入框中需要的列，
																//	如果为空则将全部列值显示（逗号分隔,如"value1,value2,value3"）
 								hide:['key2','key3']		//如果为多列数据，则指出需要被隐藏的列，默认为空数组
 								onSelect: function(e,data){	//列表选项被选中后的回调函数 onSelectFun(e,data)，默认为空函数
										//参数 e : 当前被点击的行对象，为表格的一行 <tr value='value1' dataId='data_id'> ...  </tr>
										//参数 data : 被点击行所对应的输入参数dataArray中的数据，
 									//		如 'item1' 或 ['item11','item12','item13'] 或 
										//		{key1:'value11',key2:'value12',key3:'value13'}
									}
								}
###3. Demo
假设页面中有id=inputbox的输入框
####(1) 基本使用
		$("#inputbox").SimCombox(['item1','item2','item3']);
####(2) 三列数据，第一列为需要输入的数据，并且在列表中隐藏，点击后alert对应的数据
		$("#inputbox").SimCombox(
						[
							['item11','item12','item13'],
 						['item21','item22','item23'],
 						['item31','item32','item33']
 					],
 					{
							value: '0',hide:['0'], 
							onSelect:function(e,data){
 							alert(data);
 						}
						}
		);
####(3) 三列数据第key1列为需要输入的数据，key2列在列表中隐藏，列表最大高度300px，不允许用户自主输入数据
		$("#inputbox").SimCombox(
 					[
 						{key1:'value11',key2:'value12',key3:'value13'},
 						{key1:'value21',key2:'value22',key3:'value23'},
 						{key1:'value31',key2:'value32',key3:'value33'}
 					],
						{value: 'key1',hide:['key2'],maxHeight:300,allowNew:false}
		);


