(function($) {
	
	var DropdownContainer = (function(){
		
		var storage = new Array();
		
		function Dropdown(){
					
			var pointer = this;
					
			var dataKey = null;
			var data = null;
			var textKey = null;
			var valueKey = null;
			
			var $input = null;
			var $dropdown = $("<div/>").addClass("dropdown");
			var dropdownExpandedClass = "expanded";
			var $dropdownValue = $("<div/>").addClass("dropdown_value").click(function(event){
				
				if($dropdown.hasClass(dropdownExpandedClass)){
					$dropdown.removeClass(dropdownExpandedClass);
				}else{
					
					DropdownContainer.hideAllDropdown();
					$dropdown.addClass(dropdownExpandedClass);
					
					var scrollTop = $dropdownList.scrollTop();
					scrollTop += $dropdownList.children("." + dropdownItemSelectedClass).position().top;
					$dropdownList.scrollTop(scrollTop);
										
					if(useCustomizedScroll && !scrollInitialized){
						
						var heightRatio = $dropdownList.height() / $dropdownList.prop("scrollHeight");
						if(1 != heightRatio){
							$dropdownScroll.height(heightRatio * $dropdownScrollContainer.height());
						}
						
						scrollInitialized = true;
						
					}
					if(useCustomizedScroll){
						scroll();
					}
					
					
				}
				
				event.stopPropagation();
				
			});
			var $dropdownListContainer = $("<div/>").addClass("dropdown_list_container");
			var $dropdownList = $("<ul/>").addClass("dropdown_list");
			var $dropdownScrollContainer = $("<div/>").addClass("dropdown_scroll_container");
			var $dropdownScroll = $("<span/>").addClass("dropdown_scroll");
			var $dropdownItem = $("<li/>").addClass("dropdown_item");
			var dropdownItemSelectedClass = "selected";	
			var dropdownItemDataAttrName = "data";	
			var $defaultDropdownItem = null;
			var defaultDropdownItemText = "全部";
			var defaultDropdownItemValue = "0";
			var useDefaultDropdownItem = false;
			
			var subDropdown = null;
			
			var scrollInitialized = false;
			var isScrollMouseDown = false;
			var useCustomizedScroll = false;
			
			this.init = function(config){
								
				$input = $("#" + config.inputId);
				var value = $input.val();
				dataKey = config.dataKey;
				if(config.data){
					data = config.data[dataKey];
				}
				textKey = config.textKey;
				valueKey = config.valueKey;
				if(config.useDefault){
					useDefaultDropdownItem = config.useDefault;
					if(config.defaultText){
						defaultDropdownItemText = config.defaultText;
					}
					if(config.defaultValue){
						defaultDropdownItemValue = config.defaultValue;
					}
				}
				if(config.useScroll){
					useCustomizedScroll = config.useScroll;
				}
				
				if(useCustomizedScroll){
					$dropdownList.bind("mousewheel", function(event){
					
						var delta = event.originalEvent.wheelDelta || -event.originalEvent.detail;
						var scrollTop = $dropdownList.scrollTop();
						var scrollDelta = 20;
						if(delta > 0){
							$dropdownList.scrollTop(scrollTop - scrollDelta);
						}else{
							$dropdownList.scrollTop(scrollTop + scrollDelta);
						}
						
						scroll();
						
						event.stopPropagation();
					
					});
				}

				if(useDefaultDropdownItem){
					$defaultDropdownItem = newDropdownItem(defaultDropdownItemText, defaultDropdownItemValue);
					$dropdownList.append($defaultDropdownItem);
				}
				
				var selected = false;
				if(data){
					for(var i = 0;i < data.length;i++){
						
						var $newDropdownItem = newDropdownItem(data[i][textKey], data[i][valueKey]);
						if(value && value == data[i][valueKey]){
							
							selected = true;
							
							$dropdownList.children().removeClass(dropdownItemSelectedClass);
							$newDropdownItem.addClass(dropdownItemSelectedClass);
							this.setSelectedValue(data[i][textKey], value);
							
							if(config.subDropdownConfig && this.subDropdown){
								config.subDropdownConfig.data = data[i];								
							}
							
						}
						
						$dropdownList.append($newDropdownItem);
						
					}
				}
				
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
				$input.after($dropdown);
				$input.hide();
							
				if(config.subDropdownConfig && this.subDropdown){
					
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
					
					this.subDropdown.init(config.subDropdownConfig);
					
				}
				
			};
			
			this.setSubDropdown = function(subDropdown){
				this.subDropdown = subDropdown;
			};
			var scroll = function(){
				var top = $dropdownList.scrollTop() / ($dropdownList.prop("scrollHeight") - $dropdownList.height()) * ($dropdownScrollContainer.height() - $dropdownScroll.height());
				$dropdownScroll.css("top", top + "px");
			};
			
			var newDropdownItem = function(text, value){
				var $newDropdownItem = $dropdownItem.clone();
				$newDropdownItem.text(text);
				$newDropdownItem.attr(dropdownItemDataAttrName, value);
				$newDropdownItem.click(function(event){
					
					$dropdownList.children().removeClass(dropdownItemSelectedClass);
					$thisDropdownItem = $(event.target);
					$thisDropdownItem.addClass(dropdownItemSelectedClass);
					pointer.setSelectedValue(text, value);
					pointer.hide();
					
					if(pointer.subDropdown){
						
						pointer.subDropdown.clear();
						
						if(data){
							
							for(var i = 0;i < data.length;i++){
								if(value == data[i][valueKey]){
									pointer.subDropdown.reload(data[i]);
								}
							}
							
						}
						
					}

					event.stopPropagation();
					
				});
				return $newDropdownItem;
			};
			this.hide = function(){
				$dropdown.removeClass(dropdownExpandedClass);
			};
			this.reload = function(dataToReload){
				
				if(dataToReload){
					data = dataToReload[dataKey];
				}else{
					data = null;
				}
				
				if(data){
					for(var i = 0;i < data.length;i++){
						var $newDropdownItem = newDropdownItem(data[i][textKey], data[i][valueKey]);
						$dropdownList.append($newDropdownItem);
					}
				}
				
				this.setDefaultSelectedValue();		
				
			};
			this.clear = function(){
				
				$dropdownList.empty();
				if(useCustomizedScroll){
					scrollInitialized = false;
					$dropdownScroll.height(0);
				}
				
				if(useDefaultDropdownItem){
					$defaultDropdownItem = newDropdownItem(defaultDropdownItemText, defaultDropdownItemValue);
					$dropdownList.append($defaultDropdownItem);
				}
				
				this.setDefaultSelectedValue();
				
				if(pointer.subDropdown){
					pointer.subDropdown.clear();
					pointer.subDropdown.reload();
				}
				
			};
			this.setSelectedValue = function(text, value){
				$dropdownValue.text(text);
				$dropdownValue.attr(dropdownItemDataAttrName, value);
				$input.val(value);
			};
			this.setDefaultSelectedValue = function(){
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
						this.setSelectedValue("", "");
					} 
				}
			};
			
		}
		
		return {
			build : function(config){

				var dropdown = new Dropdown();
				storage.push(dropdown);
				
				if(config.subDropdownConfig){
					dropdown.setSubDropdown(DropdownContainer.build(config.subDropdownConfig));
				}
				
				return dropdown;
				
			},
			hideAllDropdown : function(){
				for(var i = 0;i < storage.length;i++){
					storage[i].hide();
				}
			}
		};
		
	})();
		
	$.newDropdown = function(config){
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
	
	$(document).click(function(){
		DropdownContainer.hideAllDropdown();
	});
		
})(jQuery);
