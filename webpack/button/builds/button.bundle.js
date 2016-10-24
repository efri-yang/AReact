webpackJsonp([1],[
/* 0 */,
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

	var _jquery = __webpack_require__(2);

	var _jquery2 = _interopRequireDefault(_jquery);

	var _Button = __webpack_require__(3);

	var _Button2 = _interopRequireDefault(_Button);

	var _mustache = __webpack_require__(4);

	var _mustache2 = _interopRequireDefault(_mustache);

	__webpack_require__(5);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

	var Button = function () {
	    function Button(link) {
	        _classCallCheck(this, Button);

	        this.link = link;
	    }

	    _createClass(Button, [{
	        key: 'onClick',
	        value: function onClick(event) {
	            event.preventDefault();
	            alert(this.link);
	        }
	    }, {
	        key: 'render',
	        value: function render(node) {
	            var text = (0, _jquery2.default)(node).text();
	            var link = "http://www.baidu.com";
	            (0, _jquery2.default)(node).html(_mustache2.default.render(_Button2.default, {
	                text: text
	            }));

	            // Attach our listeners
	            (0, _jquery2.default)('.button').click(this.onClick.bind(this));
	        }
	    }]);

	    return Button;
	}();

	exports.default = Button;

/***/ },
/* 2 */,
/* 3 */
/***/ function(module, exports) {

	module.exports = "\r\n\t\r\n<a class=\"button\" href=\"{{link}}\">{{text}}</a>\r\n";

/***/ },
/* 4 */,
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	// style-loader: Adds some css to the DOM by adding a <style> tag

	// load the styles
	var content = __webpack_require__(6);
	if(typeof content === 'string') content = [[module.id, content, '']];
	// add the styles to the DOM
	var update = __webpack_require__(8)(content, {});
	if(content.locals) module.exports = content.locals;
	// Hot Module Replacement
	if(false) {
		// When the styles change, update the <style> tags
		if(!content.locals) {
			module.hot.accept("!!./../../node_modules/.0.25.0@css-loader/index.js!./../../node_modules/.4.0.2@sass-loader/index.js!./Button.scss", function() {
				var newContent = require("!!./../../node_modules/.0.25.0@css-loader/index.js!./../../node_modules/.4.0.2@sass-loader/index.js!./Button.scss");
				if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
				update(newContent);
			});
		}
		// When the module is disposed, remove the <style> tags
		module.hot.dispose(function() { update(); });
	}

/***/ },
/* 6 */
/***/ function(module, exports, __webpack_require__) {

	exports = module.exports = __webpack_require__(7)();
	// imports


	// module
	exports.push([module.id, ".button {\n  background: #f60;\n  color: white; }\n", ""]);

	// exports


/***/ }
]);