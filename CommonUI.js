// import UIEvent from "./UIEvent.js";

// console.log(UIEvent)
$(function(){
	// formInputText 제어
	$(".formInputText input").bind("focusin focusout", function(){
		if ($(this).attr("value") == "") {
			$(this).siblings("label").toggleClass("hide");
		}
	});

	// formInputFile 제어
	$(".formInputFile input[type='file']").change(function(){
		$(this).parent().siblings(".fileTxt").val($(this).val());
	});
});

// formLayer 제어
var scrollTopVal;
function formLayerCtrlOpen(obj) {
	// var winHeight = $(window).height();
	var winHeight = window.innerHeight;
	$("html,body").addClass("layerOpen");
	if (obj.hasClass("applyLayer")) { //채용관 리스트 지원하기
		//var ObjOffsetTop = parseInt(obj.attr("data-objtop"));
		//var ObjHeight = parseInt(obj.attr("data-objheight"));
		//var ObjOffsetVal = ObjOffsetTop - winHeight + objContent + ObjHeight;
		//$(window).scrollTop(ObjOffsetVal);
	} else {
		scrollTopVal = $(window).scrollTop();

		// 레이어 열렀을때 백그라운드 스크롤 제거를 위해 적용
		$("html,body").addClass('layerOpen');

		if(obj.find(".layerWrap").height() >= winHeight) {
			obj.find(".layerContents").css("height",winHeight - 200 + "px");
		}

		obj.find(".layerWrap").css("margin-top","-" + (obj.find(".layerWrap").height() / 2) + "px");
		// 레이어 안에 input 포커싱 일 때 키보드 때문에
		var layerTop = parseInt(obj.find(".layerWrap").css("margin-top"));
		$(window).bind("resize",function(){
			var winHeightGap = winHeight - $(this).height();
			if (winHeightGap >= 0 && $(this).height() <= obj.find(".layerWrap").height()) {
				obj.find(".layerWrap").css("margin-top", layerTop + (winHeightGap / 2) + "px");
			} else {
				obj.find(".layerWrap").css("margin-top", layerTop + "px");
				winHeight = $(this).height();
			}
		});
	}
}

var winHeightOrgin = $(window).height();
function formLayerCtrl(obj) {
	var ua = window.navigator.userAgent;
	var isAndroid = ua.indexOf('Android');
	var winHeightChange = $(window).height() + 130;
	// var androidVersion = parseFloat(ua.slice(isAndroid+8));

	// if (isAndroid >= 0 && androidVersion <= 4.4) { //킷캣 이하 버전
	if (isAndroid >= 0) {
		if (winHeightOrgin > winHeightChange) {	//입력창 구분 체크
			setTimeout(function() {
				formLayerCtrlOpen(obj);
			}, 500);
		} else {
			formLayerCtrlOpen(obj);
		}
	} else {
		formLayerCtrlOpen(obj);
	}
}

// formLayer 닫기
function formLayerClose() {
	$("html,body").removeClass("layerOpen");
	$("body").css("height","auto");
	$('.formLayer, .formLayer1, .bizFormLayer, .biz__layer-wrap, .layer-pop').hide();
	$("html, body").animate({
		scrollTop : scrollTopVal
	}, 100);
}

// 클릭수저장
function clickCounterJQuery(_catcd) {
	try{
		jQuery.ajax({
			type : "POST",
			url : "/rsc/ajax/ajaxClickCounter.asp",
			data : "catcd=" + _catcd,
			success : function(resultText) {return true},
			error: function() {return true}
		});
	}
	catch (e){
		return true;
	}
}

// JS Lazy 로딩
function loadJS(url, callfunc) {
	var blnLoaded = false;
	var s = document.createElement("script");
	s.type = "text/javascript";
	s.async = true;
	s.src = url;
	s.onreadystatechange = function() {
		if (this.readyState == "loaded" || this.readyState == "complete") {
			if (blnLoaded) return;
			blnLoaded = true;
			callfunc();
		}
	}
	s.onload = function() {callfunc();};
	document.getElementsByTagName("head")[0].appendChild(s);
	//console.log(url);
}

// 글자수 count(한/영)
function getTextLength(str) {
	var len = 0;
	for (var i = 0; i < str.length; i++) {
		if (escape(str.charAt(i)).length == 6) {
			len++;
		}
		len++;
	}
	return Math.round(len/2);
}

// 상품안내 탭
function tabGoods(options) {
	var settings = {
		tab : ".goods-tab",
		tabWrap : ".goods-tab__wrap",
		tabList : ".goods-tab__list",
		tabItem : ".goods-tab__item",
		tabMore : ".goods-tab__more",
		fixedSize : options.fixedSize || $(".headerWrap").height(),
		scrollElement : options.scrollElement,
		stickyPosElement : options.stickyPosElement,
	}
	var $tab = $(settings.tab);

	if($tab.length){
		var $tabMore = $(settings.tabMore);
		var $tabList = $(settings.tabList);
		var $tabItem = $(settings.tabItem);
		var $scrollElement = $(settings.scrollElement);
		var tabLeftPadding = $tabList.css("padding-left").replace('px','');

		var tabItemOffset = $tabItem.map(function () {
			return $(this).offset().left;
		});

		$(document).on("scroll resize",function () {
			var setScroll = Math.ceil($(this).scrollTop()) + settings.fixedSize;

			if(settings.stickyPosElement){
				tabOn(setScroll);
			}
			if($tab.hasClass("on")){
				tabItemOn(setScroll);
			}
		});

		$tabItem.click(function() {
			var offset = $scrollElement.eq($(this).index()).offset().top - settings.fixedSize;
			$("html, body").animate({scrollTop: offset}, 0);
		});

		$tabMore.click(function(){
			$(this).parent().toggleClass('more');
			if($(settings.tabItem + ".on").length){
				setScrollX($(settings.tabItem + ".on"), $(settings.tabItem + ".on").index());
			}
		});
		if(isTabScrollX() && $tab.hasClass("on")){
			$tab.addClass("scroll");
		}

		// 탭 활성화
		function tabOn(currentScroll) {
			var $stickyPosElement = $(settings.stickyPosElement);
			var tabOffset = Math.floor($stickyPosElement.offset().top);

			if (tabOffset <= currentScroll) {
				$tab.addClass('on');
				if(isTabScrollX()){
					$tab.addClass("scroll");
				}
			} else {
				$tab.removeClass('on scroll');
				$tab.scrollLeft(0);
			}
		}

		// 탭버튼 활성화
		function tabItemOn(currentScroll) {
			$scrollElement.each(function (index) {
				var thisTop = $(this).offset().top - $(window).innerHeight() * 0.2;
				var thisEnd = $(this).offset().top + $(this).outerHeight();
				var categorycd = $(this).attr('id').replace(/[^0-9]/g , "");
				var $tabButton = $(settings.tabItem + "[data-categorycd='" + categorycd + "']");
				if (thisTop <= currentScroll && thisEnd >= currentScroll) {
					$tabItem.removeClass('on');
					$tabButton.addClass('on');
					setScrollX($tabButton, index);
				}
			});
			if (Math.ceil($(window).scrollTop() + window.innerHeight) >= $('body').prop('scrollHeight')) {
				$tabItem.removeClass('on');
				$tabItem.last().addClass('on');
				$tabList.scrollLeft($tabList[0].scrollWidth);
			}
		}

		// 탭 스크롤X 유무
		function isTabScrollX(){
			return $tabList.prop('scrollWidth') > $tabList.innerWidth();
		}

		// 탭 아이템 스크롤 이동
		function setScrollX(elem, index) {
			if ($tabList.width() < elem.offset().left + elem.width() || elem.offset().left < 0) {
				$tabList.scrollLeft(tabItemOffset[index] - tabLeftPadding);
			}
		}
	}
}

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

	return {
		popup : popup,
		tab : tab,
		onAccordion : onAccordion,
		onAllChecked : onAllChecked,
		onScrollEnd : onScrollEnd,
		checkToggleBox : checkToggleBox,
		countActiveCheck : countActiveCheck,
		countTextLimit : countTextLimit,
		isInViewport : isInViewport
	}
})(jQuery);

