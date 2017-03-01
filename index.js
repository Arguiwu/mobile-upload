appUpload = function(url, ele, callback) {
	function isUploadSupported() {
		if (navigator.userAgent.match(/(Android (1.0|1.1|1.5|1.6|2.0|2.1))|(Windows Phone (OS 7|8.0))|(XBLWP)|(ZuneWP)|(w(eb)?OSBrowser)|(webOS)|(Kindle\/(1.0|2.0|2.5|3.0))/)) {
			return false;
		}
		var elem = document.createElement('input');
		elem.type = 'file';
		return !elem.disabled;
	};
	if (window.File && window.FileReader && window.FormData) {
		var fileInput = UKunit.byId(ele);
		fileInput.addEventListener('change', function (e) {
			var file = e.target.files[0];
			if (file) {
				if (/^image\//i.test(file.type)) {
					readFile(file);
				} else {
					uk.alert('您选择的不是图片', '', function() {});
				}
			}
		});
	} else {
		uk.alert('对不起，您的设备暂不支持!', '', function() {});
	}

	function readFile(file) {
		var reader = new FileReader();
		reader.onloadend = function () {
			processFile(reader.result, file.type);
		}
		reader.onerror = function () {
			uk.alert('对不起，图片上传出错!', '', function() {});
		}
		reader.readAsDataURL(file);
	}

	function processFile(dataURL, fileType) {
		var maxWidth = 800;
		var maxHeight = 800;
		var image = new Image();
		image.src = dataURL;
		image.onload = function () {
			var width = image.width;
			var height = image.height;
			var shouldResize = (width > maxWidth) || (height > maxHeight);
			if (!shouldResize) {
				sendFile(dataURL, fileType);
				return;
			}
			var newWidth;
			var newHeight;
			if (width > height) {
				newHeight = height * (maxWidth / width);
				newWidth = maxWidth;
			} else {
				newWidth = width * (maxHeight / height);
				newHeight = maxHeight;
			}
			var canvas = document.createElement('canvas');
			canvas.width = newWidth;
			canvas.height = newHeight;
			var context = canvas.getContext('2d');
			context.drawImage(this, 0, 0, newWidth, newHeight);
			dataURL = canvas.toDataURL(fileType);
			sendFile(dataURL, fileType);
		};
		image.onerror = function () {
			uk.alert('对不起，图片上传出错!', '', function() {});
		};
	};
	function sendFile(fileData, fileType) {
		// var formData = new FormData();
		// formData.append('formData', fileData);
		fileType = fileType.split('image/')[1];
		var formData = {};
		formData[fileType] = fileData.split(';base64,')[1];
		UKunit.ajax({
			type: 'POST',
			url: url,
			data: JSON.stringify(formData),
			success: function (data) {
				if (data.status == 'success') {
					callback && callback(data);
				} else {
					uk.nyTip(data.message || '对不起，图片上传出错', 1.5, 'error');
				}
			}
		});
	}
};