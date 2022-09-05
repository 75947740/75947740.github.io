/**
 * TODO HandleImage对象：图片移动和缩放
 * 
 * @param options
 * @see options.$box 图片外框
 * @see options.$img 操作的图片对象
 * @see options.$onChange 缩放比例变更回调（带当前缩放比例）
 * @see options.$allowScaling 是否允许滚轮放大或缩小效果，默认true
 */
function JQueryZoom(options) {
	this.init(options);
}
JQueryZoom.prototype.init = function(options) {
	if (!options || !options.box) return new Error('JQueryZoom need has box. ');
	options.onChange = options.onChange || null;
	options.allowScaling = options.allowScaling == false ? false : true;
	options.$box = $(options.box);
	options.$img = $(options.img || options.$box.find('img'));
	if(options.$img.length<1) // 自制图片
		options.$box.append(options.$img = $('<img>'));
	options.overflowXY = isNaN(options.overflowXY) ? 30 : Number(options.overflowXY);
	options.width = isNaN(options.width) ? 0 : Number(options.width);
	if (options.width > 0) options.$box.css('width', options.width + 'px');
	options.height = isNaN(options.height) ? 0 : Number(options.height);
	if (options.height > 0) options.$box.css('height', options.height + 'px');
	// ------[css]-----------------
	options.$box.css({
		'position': 'relative',
		'overflow': 'hidden',
	});
	options.$img.css({
		'position': 'absolute',
		'display': 'block',
		'-webkit-user-select': 'none',
		'-moz-user-select': 'none',
		'-ms-user-select': 'none',
		'user-select': 'none',
	});
	// ------[css]-----------------
	this.options = options;
	this.resetBoxWH();
	this.imgMouseEvent();
	this.mouseWheelEvent();
}
JQueryZoom.prototype.imgMouseEvent = function() {
	var self = this;
	var sX, sY, disX, disY, sImgX, sImgY, b;
	self.options.$img.on('mousedown', function(e) {
		b = true;
		sX = e.pageX;
		sY = e.pageY;
		sImgX = self.options.left;
		sImgY = self.options.top;
	});
	$(document).on('mousemove', function(e) {
		if (!b) return;
		var eXY = self.options.overflowXY;
		// 计算top位置，且限制其溢出位置：
		var top = sImgY + e.pageY - sY;
		var left = sImgX + e.pageX - sX;
		if (eXY != -1) {
			var mH = eXY == 0 ? 0 : (self.options.mHeight * self.options.nScale);
			top = Math.min(Math.max(top, -mH + eXY), self.options.bHeight - eXY);
			var mW = eXY == 0 ? 0 : (self.options.mWidth * self.options.nScale);
			left = Math.min(Math.max(left, -mW + eXY), self.options.bWidth - eXY);
		}
		// 修改图片位置：
		self.options.$img.css({
			'left': left,
			'top': top
		});
		return false;
	});
	$(document).on('mouseup', function(e) {
		b = false;
		self.options.left = parseInt(self.options.$img.css('left'));
		self.options.top = parseInt(self.options.$img.css('top'));
		self.computeCenter();
	});
}
JQueryZoom.prototype.mouseWheelEvent = function() {
	// 鼠标滚轮事件：
	var self = this;
	if (!self.options.allowScaling) return;
	var imgskim_imgBox = self.options.$box.get(0);
	if (document.attachEvent) {
		imgskim_imgBox.attachEvent('onmousewheel', move)
	};
	if (document.addEventListener) {
		imgskim_imgBox.addEventListener('mousewheel', move, false);
		imgskim_imgBox.addEventListener('mousewheel', move, false);
	};

	function move(e) {
		var up = true;
		if (e.wheelDelta) {
			up = e.wheelDelta > 0 ? true : false;
		};
		if (e.detail) {
			up = e.detail < 0 ? true : false;
		};
		self.setScale(up);
		return e.preventDefault ? e.preventDefault() : e.returnValue = false;
	};
}
/**
 * [对外提供]-重新计算盒子的宽高（在盒子宽高不固定的情况下，resize事件调用）
 */
JQueryZoom.prototype.resetBoxWH = function() {
	this.options.bWidth = this.options.$box.width();
	this.options.bHeight = this.options.$box.height();
}
JQueryZoom.prototype.getImgWH = function(src, isNormal, callback) {
	var self = this;
	var img = new Image();
	img.onload = function() {
		self.options.mWidth = img.width;
		self.options.mHeight = img.height;
		self.setStartPosition(isNormal);
		callback && callback();
	};
	img.src = src;
}
// 对外提供，输入图片地址,isNormal：true（初始不缩放）
JQueryZoom.prototype.setImage = function(src, isNormal, callback) {
	this.getImgWH(src, isNormal, callback);
	this.options.$img.attr('src', src);
}
// 初始化图片位置
JQueryZoom.prototype.setStartPosition = function(isNormal) {
	var self = this;
	var bW = self.options.bWidth = self.options.$box.width();
	bH = self.options.bHeight = self.options.$box.height();
	mW = self.options.mWidth, mH = self.options.mHeight;
	var sScale = self.options.nScale = Math.min(bW / mW, bH / mH);
	if (sScale >= 1 || isNormal) {
		self.options.nScale = 1;
		self.options.left = (bW - mW) * 0.5;
		self.options.top = (bH - mH) * 0.5;
		self.options.$img.css({
			'width': mW,
			'height': mH,
			'left': (bW - mW) * 0.5,
			'top': (bH - mH) * 0.5
		})
	} else {
		self.options.left = (bW - mW * sScale) * 0.5;
		self.options.top = (bH - mH * sScale) * 0.5;
		self.options.$img.css({
			'width': mW * sScale,
			'height': mH * sScale,
			'left': (bW - mW * sScale) * 0.5,
			'top': (bH - mH * sScale) * 0.5
		})
	};
	this.computeCenter();
}
/**
 * TODO 计算此时图片中心的位置
 */
JQueryZoom.prototype.computeCenter = function() {
	var self = this;
	this.options.centerX = self.options.left + self.options.mWidth * self.options.nScale * 0.5;
	this.options.centerY = self.options.top + self.options.mHeight * self.options.nScale * 0.5;
}
/**
 * TODO 对外提供，改变缩放大小
 * 
 * @param add/scale
 * @see add Boolean 是否放大，false缩小
 * @see scale Number 缩放数，默认0.1
 */
JQueryZoom.prototype.setScale = function(add, scale) {
	var self = this;
	scale = !scale || isNaN(scale) ? 0.1 : Number(scale);
	self.options.nScale += add ? scale : -scale;
	self.options.nScale = (isNaN(self.options.nScale) || self.options.nScale >= 10) ? 10 : self.options.nScale;
	self.options.nScale = self.options.nScale <= 0.1 ? 0.1 : self.options.nScale;
	self.options.left = self.options.centerX - self.options.mWidth * self.options.nScale * 0.5;
	self.options.top = self.options.centerY - self.options.mHeight * self.options.nScale * 0.5;
	self.options.$img.css({
		'width': self.options.mWidth * self.options.nScale,
		'height': self.options.mHeight * self.options.nScale,
		'left': isNaN(self.options.left) ? 0 : self.options.left,
		'top': isNaN(self.options.top) ? 0 : self.options.top
	});
	self.options.onChange && self.options.onChange(this.options.nScale);
}
// 对外提供，获取缩放比例
JQueryZoom.prototype.getScale = function() {
	return this.options.nScale;
}
// 对外提供，获取显示的缩放比例
JQueryZoom.prototype.getScaleShow = function() {
	return Math.round(this.getScale() * 100);
}
// $('.box').ezoom(...); or new JQueryZoom({}).setImage(...);
$.fn.ezoom = function(options, src, isNormal, onChange) {
	if (options && typeof(options) == 'string') {
		onChange = isNormal;
		isNormal = src;
		src = options;
		options = {};
	}
	if (typeof(isNormal) == 'object') onChange = isNormal;
	var jquery = window.jQuery || window.$;
	if (!jquery.ezoomObj) {
		options.box = options.box || this;
		jquery.ezoomObj = new JQueryZoom(options);
	}
	var zoom = jquery.ezoomObj;
	zoom.setImage(src, isNormal, onChange);
	return zoom;
}
