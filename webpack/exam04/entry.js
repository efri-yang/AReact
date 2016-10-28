var $ = require('jquery');
require("./1.scss");
require("./1.css") // 载入 style.css
var tpl=require("./11.html");
$(function(){
	$('#x1').html(tpl);

})