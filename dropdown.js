/**
 * @name Infinite Cascade Dropdown
 * @author Camel
 */
(function($) {
	
	// 下拉框容器
	var DropdownContainer = (function(){
		
		// 用于存储所有的下拉框
		var storage = new Array();
		
		function Dropdown(){
					
			var pointer = this;
				
			// 下拉框相关数据
			// 数据键名
			var dataKey = null;
			// 数据
			var data = null;
			// 文字键名，相当于select标签的text
			var textKey = null;
			// 值键名，相当于select标签的value
			var valueKey = null;
			
			// 下拉框相关样式
			// 自定义滚动条是都已经初始化
			var scrollInitialized = false;
			// 是否使用自定义滚动条
			var useCustomizedScroll = false;
			// 下拉框展开后的样式
			var dropdownExpandedClass = "expanded";
			// 下拉框选择后的样式
			var dropdownItemSelectedClass = "selected";
			// 存储数据的属性名称
			var dropdownItemDataAttrName = "data";
			// 默认选项
			var defaultDropdownItemText = "全部";
			var defaultDropdownItemValue = "0";
			// 是否使用默认的下拉框
			var useDefaultDropdownItem = false;
			var isScrolling = false;
			
			// 下拉框相关组件
			// 初始化时使用的input
			var $input = null;
			var $dropdown = $("<div/>").addClass("dropdown");
			// 下拉列表容器
			var $dropdownListContainer = $("<div/>").addClass("dropdown_list_container");
			// 下拉列表
			var $dropdownList = $("<ul/>").addClass("dropdown_list");
			// 自定义滚动条容器
			var $dropdownScrollContainer = $("<div/>").addClass("dropdown_scroll_container");
			// 自定义滚动条
			var $dropdownScroll = $("<span/>").addClass("dropdown_scroll");
			// 下拉框选中的值，监听click事件
			var $dropdownValue = $("<div/>").addClass("dropdown_value").click(function(event){
				
				// 若下拉框列表已经隐藏，则展开，否则隐藏
				if($dropdown.hasClass(dropdownExpandedClass)){
					$dropdown.removeClass(dropdownExpandedClass);
				}else{
										
					// 隐藏下拉框列表
					DropdownContainer.hideAllDropdown();
					$dropdown.addClass(dropdownExpandedClass);
					
					// 滚动下拉列表的可视区域
					var scrollTop = $dropdownList.scrollTop();
					scrollTop += $dropdownList.children("." + dropdownItemSelectedClass).position().top;
					$dropdownList.scrollTop(scrollTop);
									
					// 是否使用自定义滚动条，并且滚动条是否已经初始化
					if(useCustomizedScroll && !scrollInitialized){
						
						// 修改滚动条的高度，使之适应下拉列表的高度
						var heightRatio = $dropdownList.height() / $dropdownList.prop("scrollHeight");
						if(1 != heightRatio){
							$dropdownScroll.height(heightRatio * $dropdownScrollContainer.height());
						}
						
						scrollInitialized = true;
						
					}
					// 若使用自定义滚动条，则调整自定义滚动条位置
					if(useCustomizedScroll){
						scroll();
					}
					
					
				}
				
				// 阻止click事件冒泡
				event.stopPropagation();
				
			});
			// 下拉框选项
			var $dropdownItem = $("<li/>").addClass("dropdown_item");
			var $defaultDropdownItem = null;
			
			var subDropdown = null;
			
			// 初始化
			this.init = function(config){
								
				$input = $("#" + config.inputId);
				var value = $input.val();
				dataKey = config.dataKey;
				if(config.data){
					data = config.data[dataKey];
				}
				textKey = config.textKey;
				valueKey = config.valueKey;
				// 使用默认选项
				if(config.useDefault){
					useDefaultDropdownItem = config.useDefault;
					if(config.defaultText){
						defaultDropdownItemText = config.defaultText;
					}
					if(config.defaultValue){
						defaultDropdownItemValue = config.defaultValue;
					}
				}
				// 使用自定义滚动条
				if(config.useScroll){
					useCustomizedScroll = config.useScroll;
				}
				
				// 若自定义滚动条，则监听mousewheel事件
				if(useCustomizedScroll){
					
					$dropdownList.bind("mousewheel", function(event){
					
						// 滚动方向，有的浏览器使用wheelDelta，有的使用detail
						var delta = event.originalEvent.wheelDelta || -event.originalEvent.detail;
						var scrollTop = $dropdownList.scrollTop();
						// 滚动距离设为20
						var scrollDelta = 20;
						if(delta > 0){
							$dropdownList.scrollTop(scrollTop - scrollDelta);
						}else{
							$dropdownList.scrollTop(scrollTop + scrollDelta);
						}
						
						// 调整自定义滚动条位置
						scroll();
						
						// 阻止mousewheel事件冒泡
						event.stopPropagation();
					
					});
					
					// 监听mousedown事件，用于拖动滚动条
					$dropdownScroll.mousedown(function(event){
						
						// 解绑监听事件，停止拖动滚动条
						function stopScroll(){
							$(document).unbind("mouseup", stopScroll);
							$(document).unbind("mousemove", moveScroll);
							$dropdown.unbind("selectstart", disableSelection);
						}
						
						// 拖动滚动条
						function moveScroll(event){
							var delta = event.originalEvent.movementY;
							var scrollTop = $dropdownList.scrollTop() + delta / $dropdownScrollContainer.height() * $dropdownList.prop("scrollHeight");
							$dropdownList.scrollTop(scrollTop);
							scroll();
						}
						
						// 禁用选择文字
						function disableSelection(){
							return false;
						}
						
						// 是否在拖动滚动条，若是，则松开鼠标时不隐藏下拉框，否则隐藏
						isScrolling = true;
						
						// 监听事件，用于拖动滚动条
						$(document).bind("mouseup", stopScroll);
						$(document).bind("mousemove", moveScroll);
						// 监听selectstart事件，用于禁用选择文字
						$dropdown.bind("selectstart", disableSelection);
						
						// 阻止mousedown事件冒泡
						event.stopPropagation();
						
					});
				}

				// 若使用默认选项，则添加默认选项
				if(useDefaultDropdownItem){
					$defaultDropdownItem = newDropdownItem(defaultDropdownItemText, defaultDropdownItemValue);
					$dropdownList.append($defaultDropdownItem);
				}
				
				var selected = false;
				if(data){
					for(var i = 0;i < data.length;i++){
						
						// 创建新的选项
						var $newDropdownItem = newDropdownItem(data[i][textKey], data[i][valueKey]);
						if(value && value == data[i][valueKey]){
							
							selected = true;
							
							$dropdownList.children().removeClass(dropdownItemSelectedClass);
							// 添加选项选中的样式
							$newDropdownItem.addClass(dropdownItemSelectedClass);
							// 设置选中选项的值
							this.setSelectedValue(data[i][textKey], value);
							
							// 如若有子下拉框的配置，并已经设置了子下拉框，则设置子下拉框的数据
							if(config.subDropdownConfig && subDropdown){
								config.subDropdownConfig.data = data[i];								
							}
							
						}
						
						$dropdownList.append($newDropdownItem);
						
					}
				}
				
				// 若没有选中的选项，则选中默认的选项
				if(!selected){
					var $defaultSelectedDropdownItem =  $($dropdownList.children()[0]);
					$defaultSelectedDropdownItem.addClass(dropdownItemSelectedClass);
					this.setSelectedValue($defaultSelectedDropdownItem.text(), $defaultSelectedDropdownItem.attr(dropdownItemDataAttrName));
				}
				
				$dropdownListContainer.append($dropdownList);
				if(useCustomizedScroll){
					$dropdownScrollContainer.append($dropdownScroll);
					$dropdownListContainer.append($dropdownScrollContainer);
				}
				$dropdown.append($dropdownValue);
				$dropdown.append($dropdownListContainer);
				// 将下拉框添加到input后面
				$input.after($dropdown);
				// 隐藏input
				$input.hide();
							
				// 如若有子下拉框的配置，并已经设置了子下拉框，则设置子下拉框
				if(config.subDropdownConfig && subDropdown){
					
					if(!config.subDropdownConfig.textKey){
						config.subDropdownConfig.textKey = config.textKey;
					}
					if(!config.subDropdownConfig.valueKey){
						config.subDropdownConfig.valueKey = config.valueKey;
					}
					if(!config.subDropdownConfig.defaultText && config.defaultText){
						config.subDropdownConfig.defaultText = config.defaultText;
					}
					if(!config.subDropdownConfig.defaultValue && config.defaultValue){
						config.subDropdownConfig.defaultValue = config.defaultValue;
					}
					if(!config.subDropdownConfig.useDefault && config.useDefault){
						config.subDropdownConfig.useDefault = config.useDefault;
					}
					if(!config.subDropdownConfig.useScroll && config.useScroll){
						config.subDropdownConfig.useScroll = config.useScroll;
					}
					
					// 初始化子下拉框
					subDropdown.init(config.subDropdownConfig);
					
				}
				
			};
			
			// 设置子下拉框
			this.setSubDropdown = function(dropdown){
				subDropdown = dropdown;
			};
			
			// 调整自定义滚动条位置
			var scroll = function(){
				var top = $dropdownList.scrollTop() / $dropdownList.prop("scrollHeight") * $dropdownScrollContainer.height();
				$dropdownScroll.css("top", top + "px");
			};
			
			// 创建新的选项
			var newDropdownItem = function(text, value){
				var $newDropdownItem = $dropdownItem.clone();
				$newDropdownItem.text(text);
				$newDropdownItem.attr(dropdownItemDataAttrName, value);
				// 监听click事件
				$newDropdownItem.click(function(event){
					
					// 清除选中样式，并添加选中选项的选中样式
					$dropdownList.children().removeClass(dropdownItemSelectedClass);
					$thisDropdownItem = $(event.target);
					$thisDropdownItem.addClass(dropdownItemSelectedClass);
					pointer.setSelectedValue(text, value);
					// 隐藏下拉框列表
					pointer.hide();
					
					if(pointer.subDropdown){
						
						// 清空子下拉框的选项
						pointer.subDropdown.clear();
						
						if(data){
							
							for(var i = 0;i < data.length;i++){
								if(value == data[i][valueKey]){
									// 子下拉框重新读取数据
									pointer.subDropdown.reload(data[i]);
								}
							}
							
						}
						
					}

					// 阻止click事件的冒泡
					event.stopPropagation();
					
				});
				return $newDropdownItem;
			};
			
			// 隐藏下拉框列表
			this.hide = function(){
				if(!isScrolling){
					$dropdown.removeClass(dropdownExpandedClass);
				}
				isScrolling = false;
			};
			
			// 重新读取下拉框的数据
			this.reload = function(dataToReload){
				
				if(dataToReload){
					data = dataToReload[dataKey];
				}else{
					data = null;
				}
				
				// 若有数据，则重新添加选项
				if(data){
					for(var i = 0;i < data.length;i++){
						var $newDropdownItem = newDropdownItem(data[i][textKey], data[i][valueKey]);
						$dropdownList.append($newDropdownItem);
					}
				}
				
				// 设置默认选中的选项的值
				this.setDefaultSelectedValue();		
				
			};
			
			// 清空下拉框长度选项
			this.clear = function(){
				
				$dropdownList.empty();
				// 若使用自定义滚动条，则重置滚动条
				if(useCustomizedScroll){
					scrollInitialized = false;
					$dropdownScroll.height(0);
				}
				
				// 若使用默认选项，则重新添加
				if(useDefaultDropdownItem){
					$defaultDropdownItem = newDropdownItem(defaultDropdownItemText, defaultDropdownItemValue);
					$dropdownList.append($defaultDropdownItem);
				}
				
				// 设置默认选中的选项的值
				this.setDefaultSelectedValue();
				
				// 若有子下拉框，则清空子下拉框并重新读取
				if(pointer.subDropdown){
					pointer.subDropdown.clear();
					pointer.subDropdown.reload();
				}
				
			};
			
			// 设置选中的选项的值
			this.setSelectedValue = function(text, value){
				$dropdownValue.text(text);
				$dropdownValue.attr(dropdownItemDataAttrName, value);
				$input.val(value);
			};
			
			// 设置默认选中的选项的值
			this.setDefaultSelectedValue = function(){
				// 若使用默认选项，则设置默认选项的值，否则设置下拉框列表第一个选项的值
				if(useDefaultDropdownItem){
					$defaultDropdownItem.addClass(dropdownItemSelectedClass);
					this.setSelectedValue($defaultDropdownItem.text(), $defaultDropdownItem.attr(dropdownItemDataAttrName));
				}else{
					var defaultSelectedDropdownItem = $dropdownList.children()[0];
					if(defaultSelectedDropdownItem){
						var $defaultSelectedDropdownItem = $(defaultSelectedDropdownItem);
						$defaultSelectedDropdownItem.addClass(dropdownItemSelectedClass);
						this.setSelectedValue($defaultSelectedDropdownItem.text(), $defaultSelectedDropdownItem.attr(dropdownItemDataAttrName));
					}else{
						// 没有选项则设置值为空
						this.setSelectedValue("", "");
					} 
				}
			};
			
		}
		
		return {
			build : function(config){

				var dropdown = new Dropdown();
				storage.push(dropdown);
				
				// 若有子下拉框配置，则创建并设置
				if(config.subDropdownConfig){
					dropdown.setSubDropdown(this.build(config.subDropdownConfig));
				}
				
				return dropdown;
				
			},
			// 隐藏所有的下拉框列表
			hideAllDropdown : function(){
				for(var i = 0;i < storage.length;i++){
					storage[i].hide();
				}
			}
		};
		
	})();
		
	// 创建下拉框
	$.newDropdown = function(config){
		// 若配置了数据路径，则优先使用数据路径的数据
		if(config.dataPath){
			$.getJSON(config.dataPath, function(data){
				config.data = data;
				var dropdown = DropdownContainer.build(config);
				dropdown.init(config);
			});
		}else{
			var dropdown = DropdownContainer.build(config);
			dropdown.init(config);
		}
	};
	
	// 监听document的click事件
	$(document).click(function(){
		// 隐藏所有的下拉框列表
		DropdownContainer.hideAllDropdown();
	});
		
})(jQuery);
