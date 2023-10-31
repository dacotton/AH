var UIEvent = (function($){

	//Module Scope Variable
	var scopeVar = {};
	var utilMethod;

	//Util Method
	utilMethod = function(){};

	//Public Method
	var popup = (function(){
		return {
			open :function (target){
				var layer = target || ".layer-pop";
				$(layer).addClass("on");
			},
			closed :function (target){
				var layer = target || ".layer-pop";
				$(layer).removeClass("on");
			},
			onClosed :function(option){
				var options = {
					input : ".layer-pop__close-term input",
					button : ".layer-pop__close",
					parents: ".layer-pop",
				};
				$.extend(options, option);

				$(options.button).on("click",function(){
					var input = $(this).parents(options.parents).find(options.input);
					var checked = false;

					if(options.isCheck){
						if(input.is(":checked")){
							checked = true;
						}else{
							checked = false;
						}
						options.isCheck(checked, input);
					}
					$(this).parents(options.parents).removeClass("on");
				});
			}
		}
	})();

	var tab = (function(){
		function setLeft(el, tabs){
			var tab = {
				left : el.offset().left,
				width : el.outerWidth(),
			};
			tab.size = tab.left + tab.width;

			if (tab.size > tabs.size) {
				tabs.el.scrollLeft(tab.left);
			}
		}
		return {
			onActive :function(target, option){
				var options = {};
				$.extend(options, option);

				$(target).on("click",function(){
					$(target).removeClass("on");
					$(this).addClass("on");

					if(options.scrollTarget){
						setLeft($(this),options.scrollTarget);
					}
					if(options.afterClick){
						options.afterClick(this);
					}
				});
			},
			loadAdjustTabPos :function(target, targetItem){
				var tabs = {
					el : $(target),
					size : $(target).width(),
				};
				var tabItem = {
					el : $(targetItem),
					activated : $(targetItem + ".on"),
				};
				if(tabItem.activated.length > 0){
					setLeft(tabItem.activated, tabs);
				}
			}
		}
	})();

	var onAccordion = function(target){
		var accordion = target || ".accordion__title";
		$(accordion).on('click',function(){
			$(this).parent().toggleClass("on");
		});
	};

	var onAllChecked = function(targetId, checkTargetName, setCount){
		var checkbox = {
			all : $(targetId),
			single : $("input[name="+ checkTargetName +"]")
		}
		checkbox.all.on("click", function(){
			if($(this).is(":checked")){
				checkbox.single.prop("checked", true);
			}else{
				checkbox.single.prop("checked", false);
			}
			if(setCount){
				UIEvent.countActiveCheck(checkTargetName, setCount);
			}
		});
		checkbox.single.on("click",function(){
			var total = checkbox.single.length;
			var totalChecked = $("input[name="+ checkTargetName +"]:checked").length;

			if(total != totalChecked){
				checkbox.all.prop("checked", false);
			}else{
				checkbox.all.prop("checked", true);
			}
			if(setCount){
				UIEvent.countActiveCheck(checkTargetName, setCount);
			}
		});
	};

	//변수설정 리팩토링 하기
	var onScrollEnd = function(callback, target, axis){
		var element = target || window;
		var scrollElement = element;
		var elementHeight = $(element).innerHeight();

		if(element === window){
			scrollElement = "body";
			elementHeight = window.innerHeight;
		}
		function isEnd(){
			switch (axis){
				case "X":
					if($(scrollElement).prop("overflow-x") !== "hidden"){
						return Math.abs($(scrollElement).prop("scrollWidth") - $(element).scrollLeft() - element.innerWidth()) < 1;
					}
				break;
				default:
					if($(scrollElement).prop("overflow-y") !== "hidden"){
						return Math.abs($(scrollElement).prop("scrollHeight") - $(element).scrollTop() - elementHeight) < 1;
					}
				break;
			}
		}
		$(element).scroll(function(){
			if(isEnd()){
				callback();
			}
		});
	};

	var checkToggleBox = function(target, toggleTarget){
		if(target.is(":checked")){
			toggleTarget.addClass("on");
		}else{
			toggleTarget.removeClass("on");
		}
	};

	var countActiveCheck = function(checkTargetName, setCount){
		var activeLen = $("input[name="+ checkTargetName +"]:checked").length;

		if(setCount){
			setCount.text(activeLen);
		}else{
			return activeLen;
		}
	};

	// 여러개일경우 케이스 추가 필요
	var countTextLimit = function(target, maxLength, setCount){
		var valueCount = target.val().length;

		if(valueCount > maxLength) {
			target.val(target.val().substr(0, maxLength));
			valueCount = maxLength;
		}
		if(setCount){
			setCount.text(valueCount);
		}else{
			return valueCount;
		}
	};

	//디벨롭 리펙토링
	var isInViewport = function(target){
		var viewport = {
			top : $(window).scrollTop()
		};
		var bounds = {
			top : $(target).offset().top
		};
		viewport.bottom = viewport.top + window.innerHeight;
		bounds.bottom = bounds.top + $(target).outerHeight();

		return (!(viewport.bottom < bounds.top || viewport.top > bounds.bottom));
	};
	
	var scrollSectionOnTab = function(options) {
		var settings = {
			tab: "",
			tabItem: "",
			fixedSize: 0,
			scrollElement: "",
			stickyPosElement:""
		};
		$.extend(settings, options);

		var $tab = $(settings.tab);
		var $tabItem = $(settings.tabItem);

		$(document).on("scroll resize", function () {
			var setScroll = Math.ceil($(window).scrollTop()) + settings.fixedSize;
			if(settings.stickyPosElement){
				tabOn(setScroll);
			}
			if ($tab.hasClass("on")) {
				tabItemOn(setScroll);
			}
		});
		$tabItem.click(function () {
			var code = $(this).attr("data-tab-code");
			var offset = $("[data-tab-contents-code="+ code +"]").offset().top - settings.fixedSize;
			$("html, body").animate({ scrollTop: offset }, 0);
		});
		// 탭 활성화
		function tabOn(currentScroll) {
			var $stickyPosElement = $(settings.stickyPosElement);
			var tabOffset = Math.floor($stickyPosElement.offset().top);

			if (tabOffset <= currentScroll) {
				$tab.addClass("on");
			} else {
				$tab.removeClass("on");
			}
		}
		// 탭버튼 활성화
		function tabItemOn(currentScroll) {
			$(settings.scrollElement+"[data-tab-contents-code]").each(function () {
				var thisTop = $(this).offset().top - $(window).innerHeight() * 0.2;
				var thisEnd = $(this).offset().top + $(this).outerHeight();
				var sectionCode = $(this).attr("data-tab-contents-code");
				var $tabButton = $(settings.tabItem + "[data-tab-code='" + sectionCode + "']");

				if (thisTop <= currentScroll && thisEnd >= currentScroll) {
					$tabItem.removeClass("on");
					$tabButton.addClass("on");
				}
			});
			if (Math.ceil($(window).scrollTop() + window.innerHeight) >= $("body").prop("scrollHeight")) {
				$tabItem.removeClass("on");
				$tabItem.last().addClass("on");
			}
		}
	}

	return {
		popup : popup,
		tab : tab,
		onAccordion : onAccordion,
		onAllChecked : onAllChecked,
		onScrollEnd : onScrollEnd,
		checkToggleBox : checkToggleBox,
		countActiveCheck : countActiveCheck,
		countTextLimit : countTextLimit,
		isInViewport : isInViewport,
		scrollSectionOnTab : scrollSectionOnTab
	}
})(jQuery);

